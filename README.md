# Rosterly

Full-stack HR + payroll management platform, built local-compliance-first (initial target: Ethiopia).

## Stack

- **Frontend + Backend:** SvelteKit (Svelte 5, runes)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Better Auth with RBAC (employee, manager, hr_admin, owner)
- **Payroll Engine:** `packages/payroll-engine` — pure functions, zero SvelteKit imports
- **Bot:** `bot/` — standalone Telegram bot service (Layer 3)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string and auth secret

# Push database schema
npm run db:push

# Seed development data
npm run db:seed

# Start development server
npm run dev
```

## Project Structure

```
src/
  lib/
    server/        — DB client, Better Auth config, route helpers
    components/    — Reusable Svelte components
  routes/
    api/           — +server.ts route handlers
    (app)/         — Web dashboard pages (auth-guarded)
    login/         — Login page
packages/
  payroll-engine/  — Isolated payroll calculation engine
bot/               — Standalone Telegram bot service
```

## Build Order

1. **Layer 1 — HR Core:** Employee CRUD, leave requests, basic payslip view
2. **Layer 2 — Payroll Engine:** Versioned deduction rules, real payslip generation
3. **Layer 3 — Telegram Bot:** Employee self-service commands
4. **Layer 4 — Automation:** BullMQ leave-to-payroll trigger, n8n workflows
