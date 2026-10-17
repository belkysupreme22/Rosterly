<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import { TreeStructure, ArrowRight, ShieldCheck, Sparkle } from 'phosphor-svelte';

	let email = $state('owner@acme.com');
	let password = $state('password123');
	let isLoading = $state(false);
	let errorMessage = $state('');

	const quickAccounts = [
		{ label: '👑 Owner', email: 'owner@acme.com', name: 'Abebe Kebede' },
		{ label: '💰 Finance', email: 'finance@acme.com', name: 'Dawit Bekele' },
		{ label: '🛡️ HR Admin', email: 'hr@acme.com', name: 'Sara Tesfaye' },
		{ label: '👔 Manager', email: 'manager@acme.com', name: 'Daniel Hailu' },
		{ label: '👤 Employee', email: 'hana@acme.com', name: 'Hana Mulugeta' }
	];

	async function performSignIn(userEmail: string, userPass: string) {
		isLoading = true;
		errorMessage = '';

		try {
			const result = await authClient.signIn.email({
				email: userEmail,
				password: userPass
			});

			if (result.error) {
				errorMessage = result.error.message || 'Invalid email or password';
				isLoading = false;
			} else {
				// Instant client transition to dashboard
				window.location.href = '/dashboard';
			}
		} catch (err: any) {
			errorMessage = err?.message || 'An unexpected error occurred during sign in.';
			isLoading = false;
		}
	}

	function handleFormSubmit(e: SubmitEvent) {
		e.preventDefault();
		performSignIn(email, password);
	}

	function handleQuickSelect(accEmail: string) {
		email = accEmail;
		password = 'password123';
		performSignIn(accEmail, 'password123');
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
	<div class="w-full max-w-md">
		<!-- Brand Logo Header -->
		<div class="mb-8 text-center">
			<div class="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[#00C48C] text-white shadow-md mb-3">
				<TreeStructure size={28} weight="fill" />
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-slate-900">Rosterly</h1>
			<p class="mt-1 text-xs font-semibold text-slate-400">
				Next-Gen Ethiopian HR, Payroll &amp; Workforce Engine
			</p>
		</div>

		<!-- Login Card -->
		<div class="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
			<!-- 1-Click Quick Demo Login Section -->
			<div class="mb-6 rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/70">
				<div class="flex items-center gap-1.5 mb-2.5">
					<Sparkle size={15} weight="fill" class="text-[#00C48C]" />
					<span class="text-xs font-bold text-emerald-950">1-Click Fast Role Sign In</span>
				</div>
				<div class="grid grid-cols-2 gap-2">
					{#each quickAccounts as acc}
						<button
							type="button"
							onclick={() => handleQuickSelect(acc.email)}
							disabled={isLoading}
							class="flex flex-col items-start rounded-xl border border-emerald-200/90 bg-white p-2.5 text-left hover:border-[#00C48C] hover:bg-emerald-50/50 hover:shadow-2xs transition-all disabled:opacity-50"
						>
							<span class="text-xs font-bold text-slate-800">{acc.label}</span>
							<span class="text-[10px] text-slate-400 font-medium truncate w-full">{acc.name}</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="relative flex items-center justify-center mb-6">
				<div class="w-full border-t border-slate-100"></div>
				<span class="absolute bg-white px-3 text-[11px] font-semibold text-slate-400">or sign in with credentials</span>
			</div>

			<!-- Credentials Form -->
			<form onsubmit={handleFormSubmit} class="space-y-4">
				{#if errorMessage}
					<div class="rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
						{errorMessage}
					</div>
				{/if}

				<Input
					label="Email Address"
					name="email"
					type="email"
					bind:value={email}
					required
					placeholder="name@company.com"
				/>

				<Input
					label="Password"
					name="password"
					type="password"
					bind:value={password}
					required
					placeholder="••••••••"
				/>

				<button
					type="submit"
					disabled={isLoading}
					class="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#00C48C] hover:bg-[#00b07d] text-white font-bold text-sm py-3 shadow-xs transition-all disabled:opacity-50 mt-2"
				>
					<span>{isLoading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
					<ArrowRight size={16} weight="bold" />
				</button>
			</form>
		</div>

		<!-- Footer Notice -->
		<div class="mt-6 text-center">
			<span class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
				<ShieldCheck size={16} class="text-[#00C48C]" weight="bold" />
				Secured with Better Auth &bull; Ethiopian MoR Compliant
			</span>
		</div>
	</div>
</div>
