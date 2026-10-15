# BudgetWise product roadmap

**What BudgetWise is:** a personal finance tracker for people in India. Record income and spending, see where the money goes, automate the payments that repeat, and save towards goals.

**This document:** what has been built, what is pending and why, and the decisions still open. Status checked against the code on 15 Oct 2026.

Status: ✅ done · ⏸ on hold (your choice, not needed for now) · 🕓 deferred (waiting on something) · ⬜ not started · 🅿️ parked
Sizes: **S** = a day or two · **M** = about a week · **L** = two weeks or more

> Everything marked done is on the `development` branch, with CI green in both repos. **Production still runs the old v1** until the release in Part 0.

---

## Status at a glance

| Part                              | Done                                          | On hold                                                         | Still to do                                                    |
| --------------------------------- | --------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| Audit fixes (Phases 0–4)          | All 5 phases                                  |                                                                 |                                                                |
| Part 0: Release foundation        | 5 engineering items                           |                                                                 | Release work (yours): keys, deploy, Node 22, HTTPS, monitoring |
| Part 1: Core improvements         | All 9                                         |                                                                 |                                                                |
| Part 2: Intelligence and insights | 3: year compare, recurring insights, Settings | 4: trend advisor, CSV import, PDF export, weekly email          |                                                                |
| Part 3: Growth                    | 4: devices, receipts, installable app, worker | 4: accounts, debt tracker, two-factor login, push notifications | Database rename (at deploy)                                    |

**Tests:** server 108 (API, in-memory MongoDB) · app 12 unit · 33 end-to-end browser flows · 6 installable-app checks. All passing.

---

## What the app does today

| Area                    | Features                                                                                                                                                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Accounts & security** | Sign up (strength meter) · sign in, session restored on refresh · forgot password (emailed reset link, 30 min, single use) · change password (last 3 can't be reused, other devices signed out) · **signed-in devices**: see each browser/phone, sign out one or all others · rate-limited login, no "is this email registered" leaks |
| **Dashboard**           | Month picker · Excel export · left this month, income and spending vs last month, saved to goals · **month-end forecast** · daily spending chart · **category budgets** (bars, banner, warning on add) or the 50/30/20 guide · where it went · upcoming payments · recent activity · goal progress                                    |
| **Transactions**        | Grouped by day · search · filter by category, dates and **tag** · sort · count and net for all matches · 25 at a time with Load more · edit (current month; tags and receipt any month) · delete with confirmation · **receipts** (photo or PDF, 📎 on the row)                                                                       |
| **Add transaction**     | Expense / income · amount · category (default from Settings) · date · note · tags · repeat daily → yearly (7 options) with optional end date · **attach a receipt**                                                                                                                                                                   |
| **Recurring**           | All rules · pause / resume / sync · **edit** (future only), **skip next**, **delete series** · created daily, missed dates included, never duplicated · **committed per month** (all rules) · **next 30 days** · **price-change alerts** · email reminder the day before                                                              |
| **Goals**               | Create · add money (capped at the target) · progress · completed badge · delete · contributions count as savings                                                                                                                                                                                                                      |
| **Insights**            | Year picker · income, spending, average, savings rate · monthly chart · spikes and drops (3 methods) · **compare with another year** (finished months both years have, by month and by category)                                                                                                                                      |
| **Settings**            | Theme (light / dark / match system) · defaults for new transactions · email notifications (budget alerts, monthly summary, reminders) · budgets · **install the app**                                                                                                                                                                 |
| **Installable app**     | Add to home screen (Chrome, Edge, Android; Share menu on iPhone) · opens offline with the last-loaded data, read-only · "new version ready, Reload" after a deploy · offline data wiped on sign-in and sign-out                                                                                                                       |
| **Admin**               | Admins land on the Admin page: stats, weekly sign-ups, monthly active users · users list (search, last sign-in, transaction count; no amounts) · feedback triage (new / seen / done + private note)                                                                                                                                   |
| **General**             | Light / dark redesign · desktop sidebar, phone tab bar · footer with GitHub / LinkedIn · feedback form · not-found page                                                                                                                                                                                                               |
| **Behind the scenes**   | Scheduled jobs can run in a separate worker (`npm run worker`), and each runs once per day or month however many servers run · `/health` · graceful shutdown · CI on Node 20 and 22                                                                                                                                                   |

---

## 1. Done

### Audit fixes (Phases 0–4)

| Phase | What was fixed                                                                                                                                |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Secrets out of the code, Firebase removed                                                                                                     |
| 1     | Security: httpOnly secure cookies, rate limits, no account-existence leaks, input validation, 0 npm vulnerabilities                           |
| 2     | Data bugs: timezone-safe dates (server in UTC), recurring dates no longer drift, no duplicate recurring transactions                          |
| 3     | Frontend cleanup                                                                                                                              |
| 4     | Full visual redesign (light / dark), Parcel → Vite, paging with Load more, change password with reuse check, default photo fixed, new favicon |

### Part 0: Release foundation (engineering half)

| Item                                                                                       | Status                        |
| ------------------------------------------------------------------------------------------ | ----------------------------- |
| Test suites in both repos (API, unit, end-to-end, installable app)                         | ✅                            |
| GitHub Actions: lint, format check, tests, build on Node 20 and 22                         | ✅                            |
| ESLint + Prettier in both repos                                                            | ✅                            |
| `/health` endpoint; the API exits instead of running without a database; graceful shutdown | ✅                            |
| Release checklist (Node 22, `.env`, nginx, recurring-rule check, smoke test, rollback)     | ✅ in `DEPLOY_NOTES.local.md` |

### Part 1: Core improvements (complete)

| Item                                                                       | Size |
| -------------------------------------------------------------------------- | ---- |
| Edit recurring (amount, frequency, end date), skip next, delete series ✅  | M    |
| Every 2 weeks, quarterly, every 6 months ✅                                | S    |
| Footer / social links back ✅                                              | S    |
| Forgot password (emailed reset link) ✅                                    | M    |
| Tags: add / edit / remove, filter by tag ✅                                | S    |
| Admin role: overview, users list, feedback triage; admins land on Admin ✅ | S    |
| Category budgets + in-app warnings at 80% / 100% ✅                        | M    |
| Emails: budget alerts, monthly summary, reminders (each switchable) ✅     | M    |
| Savings forecast on the Dashboard ✅                                       | S    |

### Part 2: Intelligence and insights (your 3 picks)

| Item                                                                          | Size |
| ----------------------------------------------------------------------------- | ---- |
| Year-vs-year compare on Insights ✅                                           | S    |
| Recurring insights: committed per month, next 30 days, price-change alerts ✅ | S    |
| Settings page: theme, transaction defaults, emails, budgets ✅                | M    |

### Part 3: Growth (your 4 picks)

| Item                                                                                             | Size |
| ------------------------------------------------------------------------------------------------ | ---- |
| Signed-in devices: list, sign out one or all others ✅                                           | S–M  |
| Receipt upload: photo or PDF per transaction (local disk now; S3 at deploy) ✅                   | M    |
| Installable app: install, offline read-only, update prompt ✅                                    | M    |
| Separate worker for scheduled jobs; each job runs once per period (safe with several servers) ✅ | M    |

---

## 2. Pending

### Release work (yours, outside the code)

Nothing new can reach users until this is done. The steps are in `DEPLOY_NOTES.local.md`.

| Item                                                                                                          | Status | Notes                                                                                    |
| ------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| **Update the Atlas password in the EC2 `.env`**                                                               | ⬜     | **Urgent:** it was rotated on 14 Oct, so the live site probably can't reach its database |
| Rotate the old AWS, OpenAI and Firebase keys                                                                  | ⬜     | They were in git history                                                                 |
| Production deploy: merge `development` → `main`, follow the checklist                                         | ⬜     |                                                                                          |
| Node 22 on EC2 (then Vite 7)                                                                                  | ⬜     | Needed before Jan 2027 (AWS SDK)                                                         |
| HTTPS, nginx settings for receipts (6 MB uploads) and the installable app (`sw.js` not cached, manifest type) | ⬜     | In the checklist                                                                         |
| A permanent folder (or S3) for receipts                                                                       | ⬜     | Uploads must survive deploys                                                             |
| Rename the database from Atlas's default `test` to `budgetwise`                                               | ⬜     | One-time migration at deploy                                                             |
| Error tracking (Sentry), uptime check on `/api/health`, daily Atlas backup                                    | ⬜     | Needs your accounts                                                                      |

### Deferred (waiting on something)

| Item                   | Waiting on                      | Notes                                                                                                                                                                                                               |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Real email delivery 🕓 | SES out of sandbox, or SMTP     | Locally every email is printed to the server log (reset links too)                                                                                                                                                  |
| Auto-tag fixes 🕓      | The OpenAI / Claude integration | Known gaps: auto-tags skip the tag cleanup, one-word answers are dropped, the prompt always says "expense", they can overwrite manual tags, the model is outdated, nothing happens without a key (local key is off) |

### On hold (your choice, 15 Oct 2026)

| Item                                                             | Part | Size | Notes                                                                       |
| ---------------------------------------------------------------- | ---- | ---- | --------------------------------------------------------------------------- |
| Trend advisor: category trends + suggestions ⏸                   | 2    | M    | Rule-based, no AI; budgets already exist to build on                        |
| CSV / Excel import with column mapping and duplicate detection ⏸ | 2    | L    | Needs a decision: which bank formats first (or any bank via column mapping) |
| Export to PDF (monthly report) ⏸                                 | 2    | M    | Excel export covers the need today                                          |
| Weekly summary email ⏸                                           | 2    | S    | Also needs real email delivery                                              |
| Accounts (bank, card, cash) + transfers ⏸                        | 3    | L    | The biggest data-model change in the app                                    |
| Debt tracker: loans, card dues, EMI schedule ⏸                   | 3    | M    | Best built after accounts                                                   |
| Two-factor login (authenticator app + backup codes) ⏸            | 3    | M    | Signed-in devices already done                                              |
| Push notifications ⏸                                             | 3    | M    | The installable app is ready for it                                         |

### Parked (not planned)

| Feature                                   | Why                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| Multi-currency 🅿️                         | Users are in India and everything is in ₹; adds complexity to every number |
| Receipt OCR 🅿️                            | Costly per scan and error-prone; plain receipt upload is done              |
| Chatbot assistant 🅿️                      | Every question sends financial data to an AI provider: cost and privacy    |
| Developer API 🅿️                          | No demand yet; a public API is a long-term support commitment              |
| Premium insights module 🅿️                | Needs a pricing decision first                                             |
| Multi-user / shared wallets 🅿️            | Every query becomes per-wallet; only worth it with clear demand            |
| Password-protected export as specified 🅿️ | Not safe as proposed (see section 3)                                       |

---

## 3. About password-protected export

The proposed password, **first 4 letters of the name + last 4 digits of the phone** (e.g. `dhee1234`), would not protect anything:

- Anyone who knows the person's name and phone number (family, colleagues, anyone with their contact card) can open the file.
- It can never be changed. If it leaks once, every export is exposed.
- The phone number becomes part of a security secret.

**Recommended instead** (size M):

1. **Re-enter your account password** before any export. This proves it's really the account owner downloading.
2. **Optionally**, let the user type their **own** file password, and encrypt the Excel file with it (or put it in an AES-encrypted ZIP). Show it once and never store it.

This gives real protection and costs about the same to build. Until then, the export is only available to a signed-in user over HTTPS.

---

## 4. Decisions still open

1. **Password-protected export:** go with the recommended approach in section 3, or keep it parked?
2. **Editing past months:** today only the current month's amounts can be edited (tags and receipts any month). Any month, the last N months, or keep as is?
3. **Premium tier:** stay free, or plan paid features? This decides the insights module.
4. **CSV import** (if taken off hold): which banks first, or any bank through column mapping?

Decided: emails are on by default, each type switchable in Settings → Email notifications.

---

## 5. How each part ships

1. Build on `development`. Every change comes with tests.
2. CI passes, then review locally with the demo account (`demo@budgetwise.app` / `Demo@1234`; admin: `admin@budgetwise.app` / `Admin@1234`).
3. Merge to `main` and deploy, following `DEPLOY_NOTES.local.md`.
4. Watch errors and uptime for 24 hours, and roll back if needed.
