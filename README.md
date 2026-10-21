# Rosterly

An HR and payroll platform tailored for Ethiopian labor law and banking.

Most small and mid-sized companies in Ethiopia calculate payroll manually in Excel, track leave in WhatsApp groups, and re-type employment letters by hand. Western HR tools don't support Ethiopian income tax brackets, private pension rules, or local bank formats.

Rosterly handles the local compliance out of the box: progressive income tax (all 7 tiers), mandatory private pension (7% employee / 11% employer), leave tracking, role-based payroll approvals, and bulk wire exports for the Commercial Bank of Ethiopia (CBE). It also includes a Telegram bot so staff can check payslips or request leave from their phones.

## Features

- **Ethiopian Payroll Engine:** Calculates gross-to-net pay with the 7 Ministry of Revenue tax tiers, pension contributions, and unpaid leave adjustments.
- **Bank Batch Export:** Generates ready-to-upload CSV files for Commercial Bank of Ethiopia (CBE) bulk transfers.
- **Role-Based Workflows:** Separates duties cleanly — Finance drafts the payroll, the company Owner approves it, and HR manages staff records.
- **Leave Management:** Employees submit leave requests; managers review and approve against team calendars.
- **Telegram Companion:** A bot for staff self-service — check payslips, view leave balances, and request official employment verification letters.
- **Digital Verification:** Generates verification certificates with unique security tokens that banks and embassies can verify online.

## Tech Stack

- **Framework:** SvelteKit (Svelte 5) + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** Better Auth (RBAC)
- **Styling:** Tailwind CSS v4
- **Bot:** Grammy (Telegram Bot API)
- **Engine:** Pure TypeScript calculation package (`@rosterly/payroll-engine`)

## Quickstart

```bash
# 1. Clone & install
git clone https://github.com/belkysupreme22/Rosterly.git
cd Rosterly
npm install

# 2. Setup environment & database
cp .env.example .env.local
docker compose up -d
npm run db:push
npm run db:seed

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the landing page and dashboard.

## Demo Accounts

The seed script creates realistic demo accounts for each role (all passwords: `password123`):

| Role | Email | Focus |
|---|---|---|
| **Owner** | `owner@acme.com` | Final review & payroll approval |
| **Finance** | `finance@acme.com` | Run payroll, export CBE transfers |
| **HR Admin** | `hr@acme.com` | Manage team records, departments, assets |
| **Manager** | `manager@acme.com` | Team leave approvals, calendar |
| **Employee** | `hana@acme.com` | Personal payslips & leave requests |

## License

MIT
