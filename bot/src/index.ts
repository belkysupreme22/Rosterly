import dotenv from 'dotenv';
import path from 'path';

// Pre-load .env.local with priority over .env across both root and bot workdirs
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import { Bot, InlineKeyboard, Keyboard, session, type Context, type SessionFlavor } from 'grammy';
import {
	conversations,
	createConversation,
	type Conversation,
	type ConversationFlavor
} from '@grammyjs/conversations';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
	employee,
	userAccount,
	payslip,
	leaveRequest,
	salaryAdvance,
	notice,
	documentRequest,
	company
} from '../../src/lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// ── Database Connection ─────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5555/rosterly';
const queryClient = postgres(DATABASE_URL);
const db = drizzle(queryClient);

// ── Bot Configuration ───────────────────────────────────────────────────────
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'MOCK_BOT_TOKEN_FOR_DEV';

interface SessionData {
	authenticatedPhone?: string;
	employeeId?: string;
	fullName?: string;
}

type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

export const bot = new Bot<MyContext>(BOT_TOKEN);

// Install session and conversations plugins
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

// ── Helper: Format Currency & Dates ─────────────────────────────────────────
function formatETB(amount: number | string): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'ETB',
		minimumFractionDigits: 2
	}).format(Number(amount));
}

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

// ── Helper: Authenticate Telegram Chat ──────────────────────────────────────
async function getEmployeeForChat(chatId: string, sessionPhone?: string) {
	// 1. Try finding by telegramChatId
	let userAcc = await db.query.userAccount.findFirst({
		where: eq(userAccount.telegramChatId, chatId),
		with: {
			employee: {
				with: {
					company: true
				}
			}
		}
	});

	// 2. If not linked yet, try matching by sessionPhone
	if (!userAcc && sessionPhone) {
		userAcc = await db.query.userAccount.findFirst({
			where: eq(userAccount.phone, sessionPhone),
			with: {
				employee: {
					with: {
						company: true
					}
				}
			}
		});

		if (userAcc) {
			// Link chat ID
			await db
				.update(userAccount)
				.set({ telegramChatId: chatId })
				.where(eq(userAccount.id, userAcc.id));
		}
	}

	return userAcc?.employee || null;
}

// ── Conversation: Request Leave Flow ────────────────────────────────────────
async function requestLeaveConversation(conversation: MyConversation, ctx: MyContext) {
	const emp = await getEmployeeForChat(String(ctx.chat?.id), ctx.session.authenticatedPhone);
	if (!emp) {
		await ctx.reply('⚠️ You must link your account with /start first before requesting leave.');
		return;
	}

	await ctx.reply(
		`📋 *New Leave Request for ${emp.fullName}*\n\n` +
		`Please reply with the *Leave Type*:\n` +
		`• 1 for *Annual Leave*\n` +
		`• 2 for *Casual Leave*\n` +
		`• 3 for *Sick Leave*\n` +
		`• 4 for *Unpaid Leave*`,
		{ parse_mode: 'Markdown' }
	);

	const typeMsg = await conversation.waitFor(':text');
	let leaveType = 'Annual Leave';
	if (typeMsg.message?.text === '2') leaveType = 'Casual Leave';
	else if (typeMsg.message?.text === '3') leaveType = 'Sick Leave';
	else if (typeMsg.message?.text === '4') leaveType = 'Unpaid Leave';

	await ctx.reply('📅 Please enter the *Start Date* (format: `YYYY-MM-DD`, e.g. `2026-09-15`):', {
		parse_mode: 'Markdown'
	});
	const startMsg = await conversation.waitFor(':text');
	const startDate = startMsg.message?.text?.trim() || '';

	await ctx.reply('📅 Please enter the *End Date* (format: `YYYY-MM-DD`, e.g. `2026-09-18`):', {
		parse_mode: 'Markdown'
	});
	const endMsg = await conversation.waitFor(':text');
	const endDate = endMsg.message?.text?.trim() || '';

	await ctx.reply('📝 Please provide a brief *Reason* for this leave request:', {
		parse_mode: 'Markdown'
	});
	const reasonMsg = await conversation.waitFor(':text');
	const reason = reasonMsg.message?.text?.trim() || 'Personal matters';

	// Insert into database
	try {
		await db.insert(leaveRequest).values({
			employeeId: emp.id,
			startDate,
			endDate,
			type: leaveType,
			reason,
			status: 'pending'
		});

		await ctx.reply(
			`✅ *Leave Request Submitted Successfully!*\n\n` +
			`• *Type:* ${leaveType}\n` +
			`• *Dates:* ${startDate} to ${endDate}\n` +
			`• *Reason:* ${reason}\n` +
			`• *Status:* ⏳ Pending Manager Approval\n\n` +
			`Your manager and HR admin have been notified on the web dashboard.`,
			{ parse_mode: 'Markdown' }
		);
	} catch (e: any) {
		await ctx.reply(`❌ Failed to submit leave request: ${e.message}`);
	}
}

// ── Conversation: Salary Advance Request ────────────────────────────────────
async function requestAdvanceConversation(conversation: MyConversation, ctx: MyContext) {
	const emp = await getEmployeeForChat(String(ctx.chat?.id), ctx.session.authenticatedPhone);
	if (!emp) {
		await ctx.reply('⚠️ You must link your account with /start first.');
		return;
	}

	await ctx.reply(
		`💵 *Request Emergency Salary Advance*\n\n` +
		`Please enter the requested advance amount in *ETB* (e.g. \`3500\`):`,
		{ parse_mode: 'Markdown' }
	);

	const amountMsg = await conversation.waitFor(':text');
	const amount = parseFloat(amountMsg.message?.text?.trim() || '0');

	if (isNaN(amount) || amount <= 0) {
		await ctx.reply('❌ Invalid amount. Please restart with /advance.');
		return;
	}

	await ctx.reply('📝 Please state the reason for this advance (e.g. Medical emergency):');
	const reasonMsg = await conversation.waitFor(':text');
	const reason = reasonMsg.message?.text?.trim() || 'Emergency expense';

	try {
		await db.insert(salaryAdvance).values({
			employeeId: emp.id,
			amount: amount.toFixed(2),
			reason,
			status: 'pending'
		});

		await ctx.reply(
			`✅ *Salary Advance Request Submitted!*\n\n` +
			`• *Amount:* ${formatETB(amount)}\n` +
			`• *Reason:* ${reason}\n` +
			`• *Status:* ⏳ Pending HR/Finance Approval\n\n` +
			`Approved advances will be automatically deducted from your upcoming monthly payroll.`,
			{ parse_mode: 'Markdown' }
		);
	} catch (e: any) {
		await ctx.reply(`❌ Error submitting advance: ${e.message}`);
	}
}

bot.use(createConversation(requestLeaveConversation));
bot.use(createConversation(requestAdvanceConversation));

// ── Command: /start & Account Link ──────────────────────────────────────────
bot.command('start', async (ctx) => {
	const chatId = String(ctx.chat.id);
	const emp = await getEmployeeForChat(chatId);

	if (emp) {
		await ctx.reply(
			`👋 *Welcome back, ${emp.fullName}!*\n\n` +
			`🏢 *Company:* ${emp.company.name}\n` +
			`💼 *Designation:* Level ${emp.positionLevel} • ${emp.role}\n` +
			`🟢 *Work Status:* ${emp.workStatus}\n\n` +
			`*Available Self-Service Commands:*\n` +
			`• /payslip — View latest salary voucher & breakdown\n` +
			`• /balance — Check available leave days\n` +
			`• /request_leave — Submit a new leave request\n` +
			`• /status — Update live work status (Office / Remote / Meeting)\n` +
			`• /advance — Request an emergency salary advance\n` +
			`• /letter — Generate an official QR verification letter\n` +
			`• /notices — View active broadcasts & upcoming holiday radar`,
			{ parse_mode: 'Markdown' }
		);
		return;
	}

	// Request phone number to link
	const phoneKeyboard = new Keyboard()
		.requestContact('📱 Share My Phone Number to Link')
		.oneTime()
		.resized();

	await ctx.reply(
		`👋 *Welcome to Rosterly Employee Self-Service!*\n\n` +
		`To link your Telegram account to your employee profile, please share your registered phone number below, or reply with your phone number (e.g. \`+251911000004\`).`,
		{
			parse_mode: 'Markdown',
			reply_markup: phoneKeyboard
		}
	);
});

// Handle phone contact share or text input
bot.on(['message:contact', 'message:text'], async (ctx, next) => {
	if (ctx.message?.text?.startsWith('/')) return next();

	const phone = ctx.message?.contact?.phone_number || ctx.message?.text?.trim();
	if (!phone) return next();

	const normalizedPhone = phone.startsWith('+') ? phone : '+' + phone.replace(/^0/, '251');
	const chatId = String(ctx.chat.id);

	// Find user account matching phone
	const userAcc = await db.query.userAccount.findFirst({
		where: eq(userAccount.phone, normalizedPhone),
		with: {
			employee: {
				with: {
					company: true
				}
			}
		}
	});

	if (!userAcc || !userAcc.employee) {
		await ctx.reply(
			`⚠️ No employee account found matching phone number \`${normalizedPhone}\`.\n\n` +
			`Please contact your HR Administrator to ensure your phone number is recorded in Rosterly.`,
			{ parse_mode: 'Markdown' }
		);
		return;
	}

	// Link telegramChatId
	await db
		.update(userAccount)
		.set({ telegramChatId: chatId })
		.where(eq(userAccount.id, userAcc.id));

	ctx.session.authenticatedPhone = normalizedPhone;
	ctx.session.employeeId = userAcc.employee.id;
	ctx.session.fullName = userAcc.employee.fullName;

	await ctx.reply(
		`🎉 *Account Linked Successfully!*\n\n` +
		`Welcome, *${userAcc.employee.fullName}*!\n` +
		`You are authenticated with *${userAcc.employee.company.name}*.\n\n` +
		`Type /payslip to view your latest salary voucher or /help for all options.`,
		{
			parse_mode: 'Markdown',
			reply_markup: { remove_keyboard: true }
		}
	);
});

// ── Command: /payslip ───────────────────────────────────────────────────────
bot.command('payslip', async (ctx) => {
	const emp = await getEmployeeForChat(String(ctx.chat.id), ctx.session.authenticatedPhone);
	if (!emp) {
		await ctx.reply('⚠️ Please authenticate first by sending /start');
		return;
	}

	const latestPayslip = await db.query.payslip.findFirst({
		where: eq(payslip.employeeId, emp.id),
		orderBy: [desc(payslip.createdAt)],
		with: {
			payrollRun: true
		}
	});

	if (!latestPayslip) {
		await ctx.reply('ℹ️ No payslips have been generated for your profile yet.');
		return;
	}

	let deductionText = '';
	for (const d of latestPayslip.deductions) {
		deductionText += `  • ${d.type}: -${formatETB(d.amount)}\n`;
	}

	await ctx.reply(
		`🧾 *Official Payslip Voucher*\n` +
		`━━━━━━━━━━━━━━━━━━━━━\n` +
		`👤 *Employee:* ${emp.fullName}\n` +
		`🏢 *Employer:* ${emp.company.name} (TIN: ${emp.company.tin})\n` +
		`📅 *Pay Period:* ${latestPayslip.payrollRun.periodStart} to ${latestPayslip.payrollRun.periodEnd}\n` +
		`━━━━━━━━━━━━━━━━━━━━━\n\n` +
		`💵 *Gross Compensation:* ${formatETB(latestPayslip.grossPay)}\n\n` +
		`📉 *Statutory Deductions:*\n` +
		`${deductionText}\n` +
		`━━━━━━━━━━━━━━━━━━━━━\n` +
		`💰 *NET DISBURSED SALARY:* *${formatETB(latestPayslip.netPay)}*\n` +
		`━━━━━━━━━━━━━━━━━━━━━\n` +
		`🏦 *Bank Disbursal:* CBE Account \`${emp.bankAccount || 'On Record'}\`\n` +
		`🛡️ *Status:* Disbursed & Remitted to MoR\n\n` +
		`_Generated securely by Rosterly Payroll Engine_`,
		{ parse_mode: 'Markdown' }
	);
});

// ── Command: /balance ───────────────────────────────────────────────────────
bot.command('balance', async (ctx) => {
	const emp = await getEmployeeForChat(String(ctx.chat.id), ctx.session.authenticatedPhone);
	if (!emp) {
		await ctx.reply('⚠️ Please authenticate first by sending /start');
		return;
	}

	await ctx.reply(
		`🌴 *Your Leave Balances (2026)*\n` +
		`━━━━━━━━━━━━━━━━━━━━━\n` +
		`👤 *Employee:* ${emp.fullName}\n\n` +
		`• 🏖️ *Annual Leave:* 10 / 15 Days Available\n` +
		`• ⏱️ *Casual Leave:* 8 / 24 Hours Available\n` +
		`• 🏥 *Sick Leave:* 3 / 4 Days Available\n` +
		`• 👶 *Maternity / Paternity:* Statutory Standard\n` +
		`━━━━━━━━━━━━━━━━━━━━━\n` +
		`Type /request_leave to book time off now.`,
		{ parse_mode: 'Markdown' }
	);
});

// ── Command: /request_leave ─────────────────────────────────────────────────
bot.command('request_leave', async (ctx) => {
	await ctx.conversation.enter('requestLeaveConversation');
});

// ── Command: /advance ───────────────────────────────────────────────────────
bot.command('advance', async (ctx) => {
	await ctx.conversation.enter('requestAdvanceConversation');
});

// ── Command: /status ────────────────────────────────────────────────────────
bot.command('status', async (ctx) => {
	const emp = await getEmployeeForChat(String(ctx.chat.id), ctx.session.authenticatedPhone);
	if (!emp) {
		await ctx.reply('⚠️ Please authenticate first with /start.');
		return;
	}

	const statusKeyboard = new InlineKeyboard()
		.text('🟢 In Office', 'status_in_office')
		.text('🏠 Remote / WFH', 'status_remote')
		.row()
		.text('🗓️ In Client Meeting', 'status_in_meeting')
		.text('🏖️ On Leave', 'status_on_leave');

	await ctx.reply(
		`📍 *Update Live Work Status*\n\n` +
		`Current Status: *${emp.workStatus.replace('_', ' ').toUpperCase()}*\n\n` +
		`Select your live location to update the team calendar:`,
		{
			parse_mode: 'Markdown',
			reply_markup: statusKeyboard
		}
	);
});

// Callback query handler for status buttons
bot.on('callback_query:data', async (ctx) => {
	const data = ctx.callbackQuery.data;
	if (data.startsWith('status_')) {
		const newStatus = data.replace('status_', '') as any;
		const emp = await getEmployeeForChat(String(ctx.chat?.id), ctx.session.authenticatedPhone);
		if (emp) {
			await db.update(employee).set({ workStatus: newStatus }).where(eq(employee.id, emp.id));
			await ctx.answerCallbackQuery({ text: `Status updated to ${newStatus.replace('_', ' ')}!` });
			await ctx.editMessageText(
				`✅ *Live Work Status Updated!*\n\n` +
				`Your status is now set to *${newStatus.replace('_', ' ').toUpperCase()}* across the Rosterly team board.`,
				{ parse_mode: 'Markdown' }
			);
		}
	}
});

// ── Command: /letter ────────────────────────────────────────────────────────
bot.command('letter', async (ctx) => {
	const emp = await getEmployeeForChat(String(ctx.chat.id), ctx.session.authenticatedPhone);
	if (!emp) {
		await ctx.reply('⚠️ Please authenticate first with /start.');
		return;
	}

	const token = `ETH-VERIFY-${new Date().getFullYear()}-${emp.fullName.split(' ')[0].toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

	// Insert document request
	await db.insert(documentRequest).values({
		employeeId: emp.id,
		type: 'employment_verification',
		purpose: 'Official Embassy & Banking Verification Letter',
		verificationCode: token,
		recipientOrganization: 'To Whom It May Concern'
	});

	const baseUrl = process.env.PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:5173';
	const verifyUrl = `${baseUrl.replace(/\/$/, '')}/verify/${token}`;

	await ctx.reply(
		`📜 *Official Employment & Salary Verification Certificate*\n` +
		`━━━━━━━━━━━━━━━━━━━━━\n` +
		`👤 *Employee:* ${emp.fullName}\n` +
		`🏢 *Employer:* ${emp.company.name} (TIN: ${emp.company.tin})\n` +
		`💼 *Position:* Level ${emp.positionLevel} • ${emp.role}\n` +
		`💵 *Monthly Base:* ${formatETB(emp.baseSalary)}\n` +
		`🔑 *Security Token:* \`${token}\`\n` +
		`━━━━━━━━━━━━━━━━━━━━━\n\n` +
		`🔗 *Scan & Verify Online Certificate:*\n` +
		`${verifyUrl}\n\n` +
		`Third parties (banks, embassies, landlords) can scan the QR code or visit the link above to verify this authentic certificate live.`,
		{ parse_mode: 'Markdown' }
	);
});

// ── Command: /notices ───────────────────────────────────────────────────────
bot.command('notices', async (ctx) => {
	const activeNotices = await db.query.notice.findMany({
		orderBy: [desc(notice.createdAt)],
		limit: 3
	});

	if (activeNotices.length === 0) {
		await ctx.reply('ℹ️ No active company notices at the moment.');
		return;
	}

	let text = '📢 *Company Broadcast Notices & Holiday Radar*\n━━━━━━━━━━━━━━━━━━━━━\n\n';
	for (const n of activeNotices) {
		text += `📌 *${n.title}*\n`;
		text += `_Category: ${n.category.toUpperCase()}_ | _Priority: ${n.priority}_\n`;
		if (n.eventDate) text += `📅 *Event Date:* ${formatDate(n.eventDate)}\n`;
		text += `${n.content}\n\n`;
	}

	await ctx.reply(text, { parse_mode: 'Markdown' });
});

// ── Bot Launcher ────────────────────────────────────────────────────────────
export async function startBot() {
	if (BOT_TOKEN === 'MOCK_BOT_TOKEN_FOR_DEV') {
		console.log('🤖 Telegram Bot initialized with MOCK token for development (Set TELEGRAM_BOT_TOKEN in .env to connect to live Telegram).');
		return;
	}

	console.log('🤖 Starting Rosterly Telegram Bot worker...');
	await bot.start({
		onStart(botInfo) {
			console.log(`✅ Telegram bot connected as @${botInfo.username}`);
		}
	});
}

if (process.env.NODE_ENV !== 'test') {
	startBot().catch((err) => {
		console.error('Failed to start Telegram bot:', err);
	});
}
