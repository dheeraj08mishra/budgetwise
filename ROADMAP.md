# BudgetWise product roadmap

**What BudgetWise is:** a personal finance tracker for people in India. Record income and spending, see where the money goes, automate the payments that repeat, and save towards goals.

**This document:** every feature on the list, its real status in the code (checked on 15 Oct 2026), what's worth building next, what to park, and the v2 rollout in parts.

Status: ✅ done · 🟡 partly done · ⬜ not started · ⚠️ removed in the redesign
Sizes: **S** = a day or two · **M** = about a week · **L** = two weeks or more

> Everything marked done is on the `development` branch. **Production still runs the old v1** until the release in Part 0.

---

## What the app does today

| Area                    | Features                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Accounts & security** | Sign up (strength meter, show/hide password) · sign in, session kept for a day and restored on refresh · expired session signs you out with a message · change password (signs out other devices, last 3 can't be reused) · profile (name, phone, gender, photo, initials fallback) · forgot password (emailed reset link) · rate-limited login, no "is this email registered" leaks |
| **Dashboard**           | Month picker · Excel export · left this month, income and spending vs last month, saved to goals · daily spending chart · 50/30/20 budget guide · where it went (by category) · upcoming recurring payments · recent activity with edit/delete · goal progress                                                                                                                       |
| **Transactions**        | Grouped by day with daily totals · search by note · filter by category and dates · sort by date or amount · count and net for all matches · 25 at a time with Load more · edit (current month) · delete with confirmation · auto-tags shown                                                                                                                                          |
| **Add transaction**     | Expense / income · amount · category · date · note · repeat daily / weekly / every 2 weeks / monthly / quarterly / every 6 months / yearly · auto-tags from the note (OpenAI)                                                                                                                                                                                                        |
| **Recurring**           | All rules, active and paused · monthly in / out estimate · pause (confirm) / resume · sync now · created automatically every day, missed dates included, never duplicated · email reminder the day before                                                                                                                                                                            |
| **Goals**               | Create · add money (quick amounts, capped at the target) · progress · completed badge · delete with confirmation · contributions count as savings                                                                                                                                                                                                                                    |
| **Insights**            | Year picker · income, spending, average, savings rate · monthly chart · spikes and drops highlighted (3 methods) · plain-language alerts · compare with another year                                                                                                                                                                                                                 |
| **General**             | Settings page (theme incl. match system, defaults for new transactions, emails, budgets) · light / dark theme · desktop sidebar, phone tab bar · feedback form · not-found page                                                                                                                                                                                                      |

---

## 1. Feature status

### v1 features (confirmed existing)

| Feature                           | Status | Where it is now                                            |
| --------------------------------- | ------ | ---------------------------------------------------------- |
| Live transaction updates          | ✅     | Dashboard and Transactions refresh after every change      |
| Edit and delete controls          | ✅     | Edit dialog; delete asks for confirmation                  |
| Add recurring transactions        | ✅     | "Repeat automatically" on Add transaction                  |
| Monthly dashboard from history    | ✅     | Month picker on the Dashboard                              |
| Profile management                | ✅     | Profile page, plus change password                         |
| JWT auth                          | ✅     | httpOnly cookie, secure flags, rate limits, session expiry |
| Responsive UI                     | ✅     | Desktop sidebar, phone tab bar                             |
| Search and sort                   | ✅     | Transactions toolbar                                       |
| Filterable history                | ✅     | Category, date range, sort; loads 25 at a time             |
| Budget tracker section            | ✅     | 50/30/20 budget guide on the Dashboard                     |
| Category-wise and day-wise charts | ✅     | "Where it went" donut, daily spending chart                |
| Income vs expense breakdown       | ✅     | Dashboard cards and the Insights page                      |
| Transaction management            | ✅     | Add, edit, delete, export                                  |

### v2 Phase 1 list (core improvements)

| Feature                                     | Your list | Real status | Notes                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------- | --------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend date validation fix                 | done      | ✅          | Timezone-safe; IST users can add "today" after midnight                                                                                                                                                                                                                                                  |
| Date validation with an npm date library    | done      | ✅          | date-fns on both sides                                                                                                                                                                                                                                                                                   |
| Export to Excel                             | done      | ✅          | Dashboard → Export, per month                                                                                                                                                                                                                                                                            |
| Debounced search                            | done      | ✅          | 300 ms on Transactions                                                                                                                                                                                                                                                                                   |
| Feedback form                               | done      | ✅          | "Send feedback" in the sidebar / account menu                                                                                                                                                                                                                                                            |
| Backend pagination / infinite scroll        | done      | ✅          | Server paging with "Load more"                                                                                                                                                                                                                                                                           |
| Email service (Amazon SES)                  | done      | ✅          | SES client and mailer set up                                                                                                                                                                                                                                                                             |
| Stop recurring transactions                 | done      | ✅          | Pause / resume, delete a series (past transactions kept), optional end date                                                                                                                                                                                                                              |
| Email notifications                         | done      | ✅          | Budget alerts (80% / over, once each per month), monthly summary on the 1st, payment reminders; each can be switched off in Settings                                                                                                                                                                     |
| Recurring options (daily → yearly)          | done      | ✅          | Daily, weekly, every 2 weeks, monthly, quarterly, every 6 months, yearly                                                                                                                                                                                                                                 |
| Footer component                            | done      | ✅          | Back on every page and the login screen                                                                                                                                                                                                                                                                  |
| Social media links (GitHub, LinkedIn)       | done      | ✅          | In the footer                                                                                                                                                                                                                                                                                            |
| Goal-based budgeting                        | pending   | ✅          | Goals page: targets, contributions, progress, completion                                                                                                                                                                                                                                                 |
| Edit recurring transactions with validation | pending   | ✅          | Edit amount, type, category, note, frequency, end date (future only, no back-fill); skip next payment                                                                                                                                                                                                    |
| Custom labels for transactions              | pending   | ✅          | Add / edit / remove tags (any month, Hindi works), filter by tag, click a tag to filter; auto-tags from the note still added                                                                                                                                                                             |
| Category budget warning notifications       | pending   | ✅          | Budget per category; Dashboard bars + banner, warning on add, email at 80% and when over                                                                                                                                                                                                                 |
| CSV / Excel import                          | pending   | ⬜          |                                                                                                                                                                                                                                                                                                          |
| Export to PDF                               | pending   | ⬜          |                                                                                                                                                                                                                                                                                                          |
| User settings panel                         | pending   | ✅          | Settings page: theme (light / dark / match system), default category and repeat for new transactions, email notifications, budgets; link to Profile                                                                                                                                                      |
| Multi-user groundwork (shared wallets)      | pending   | ⬜          |                                                                                                                                                                                                                                                                                                          |
| Password-protected export                   | pending   | ⬜          | See section 4: the proposed password scheme isn't safe                                                                                                                                                                                                                                                   |
| Admin role                                  | pending   | ✅          | Admins land on the Admin page: overview (stats, weekly sign-ups, monthly active users, goals/recurring/budget totals), searchable users list (joined, last sign-in, transaction count; no amounts) and feedback triage (new/seen/done + private note). Granted only with `npm run make-admin -- <email>` |

### v2 Phase 2 list (intelligence and insights)

| Feature                         | Real status | Notes                                                                                                                                                    |
| ------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yearly dashboard + compare      | ✅          | Insights: full year by month, plus "2026 vs 2025" (totals over finished months both years have, month-by-month chart, spending by category)              |
| Smart trend advisor (spikes)    | 🟡          | Spike/drop detection with 3 methods and plain-language alerts. **Missing:** suggestions ("dining is up 40%, try…")                                       |
| Recurring transaction dashboard | ✅          | Recurring page: list, pause, resume, sync, edit, skip next, delete, monthly in/out over all rules, next 30 days, price-change alerts (went up / will be) |
| Savings forecasting             | ✅          | Month-end forecast on the Dashboard: income + recurring income still due − spending − everyday pace × days left − recurring payments still due − savings |
| Insights module (premium)       | ⬜          | Needs a pricing decision first                                                                                                                           |

### v2 Phase 3 and stretch

| Feature                                            | Status |
| -------------------------------------------------- | ------ |
| Multi-currency                                     | ⬜     |
| Receipt upload + OCR                               | ⬜     |
| Debt tracker (loans, cards, EMIs)                  | ⬜     |
| Offline mode / installable app (PWA)               | ⬜     |
| Chatbot assistant ("how much on food last month?") | ⬜     |
| Developer API                                      | ⬜     |

### Also done (not on the list)

Security hardening (secrets removed, rate limits, secure cookies, 0 vulnerabilities) · change password with sign-out of other devices and no reuse of the last 3 · full visual redesign with light/dark themes · Insights page · demo account seed · Vite build · new favicon.

---

## 2. What's useful now, later, or parked

### 🟢 Build next: high value, mostly building on what exists

| Feature                                                                       | Why now                                                                                   | Size |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---- |
| **Edit recurring** (amount, frequency, end date) + **skip once** + **delete** | Listed as your 1st priority; the engine already supports end dates and anchored schedules | M    |
| **More frequencies:** biweekly, quarterly, half-yearly                        | The shared recurrence code makes this a small change                                      | S    |
| **Category budgets + warnings** (in the app first)                            | Turns tracking into planning; the budget guide already has the UI pattern                 | M    |
| **Monthly summary + overspending emails**                                     | SES is already working; only the email content and scheduling are missing                 | M    |
| **Tags you can edit + filter by tag**                                         | Tags already exist on every transaction; the filter is half-wired on the server           | S    |
| **Footer / social links back**                                                | Lost in the redesign; small links at the bottom of the sidebar and on the login page      | S    |
| **Forgot password** (emailed reset link)                                      | Today a user who forgets their password is locked out for good                            | M    |
| **Admin role (read-only)**: view feedback, user count                         | You can't read the feedback users send without querying the database                      | S    |
| **Savings forecast** ("at this pace, ₹X left on the 30th")                    | Simple maths on data the Dashboard already loads                                          | S    |
| **Year-vs-year compare** on Insights                                          | The monthly summary API already has the data                                              | S    |

### 🟡 Later: useful, but bigger or depends on something else

| Feature                                    | Why later                                                                                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **CSV / Excel import**                     | High value (manual entry is why people quit budgeting apps), but each bank's format differs. Do it once categories and budgets are solid |
| **Export to PDF**                          | Excel covers the need; PDF is a nicer report for sharing                                                                                 |
| **User settings panel**                    | Becomes worthwhile once there are settings to hold (budgets, notifications)                                                              |
| **Trend advisor suggestions**              | Build after category budgets, so advice can say "over budget" not just "higher"                                                          |
| **Debt tracker (EMIs, cards)**             | Needs accounts and transfers first, or numbers double-count                                                                              |
| **Installable app (PWA)**                  | Good for phones; worth doing once the core features settle                                                                               |
| **Two-factor login, active sessions page** | Security upgrades once there are more users                                                                                              |

### 🔴 Park: not now

| Feature                                    | Why park                                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Multi-currency**                         | Users are in India and everything is in ₹; adds complexity to every number                                       |
| **Receipt OCR**                            | Costly per scan and error-prone; plain receipt upload (no OCR) can come first if wanted                          |
| **Chatbot assistant**                      | Every question sends financial data to an AI provider: cost and privacy questions. Revisit after insights mature |
| **Developer API**                          | No demand yet; a public API is a long-term support commitment                                                    |
| **Premium insights module**                | Needs a pricing decision first (see decisions)                                                                   |
| **Multi-user / shared wallets**            | A big data-model change (every query becomes per-wallet); only worth it with clear demand                        |
| **Custom labels as a premium feature**     | Basic tag editing is cheap and expected; keep it free (in "Build next")                                          |
| **Password-protected export as specified** | See section 4                                                                                                    |

---

## 3. v2 rollout plan

### Part 0: Release foundation (do first)

**Goal:** put today's work live safely, and make future changes testable.

| Item                                                                                                                                         | Status                        |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Test suites in the repos: server `npm test` (API tests, in-memory MongoDB), app `npm test` (unit tests) + `npm run test:e2e` (browser flows) | ✅                            |
| GitHub Actions: lint, format check, tests, build on Node 20 and 22                                                                           | ✅                            |
| ESLint + Prettier in both repos                                                                                                              | ✅                            |
| `/health` endpoint; the API exits instead of running without a database; graceful shutdown                                                   | ✅                            |
| Release checklist (Node 22, `.env`, nginx, recurring-rule check, smoke test, rollback)                                                       | ✅ in `DEPLOY_NOTES.local.md` |
| Finish secret rotation (AWS, OpenAI, Firebase key)                                                                                           | ⬜ yours                      |
| Production deploy following the checklist (merge to `main`, EC2)                                                                             | ⬜ yours                      |
| Node 22 on EC2, then Vite 7                                                                                                                  | ⬜ yours (in the checklist)   |
| Error tracking (Sentry) + uptime check on `/api/health` + daily Atlas backup                                                                 | ⬜ needs your accounts        |

### Part 1: Core improvements and quick wins

| Order | Item                                                                    | Size |
| ----- | ----------------------------------------------------------------------- | ---- |
| 1     | Edit recurring (amount, frequency, end date), skip once, delete ✅      | M    |
| 1     | Biweekly, quarterly, half-yearly frequencies ✅                         | S    |
| 1     | Footer / social links back ✅                                           | S    |
| 2     | Forgot password (SES email reset link) ✅                               | M    |
| 2     | Tags: add / edit / remove, filter by tag ✅                             | S    |
| 2     | Admin role (stats, activity, users, feedback triage) ✅                 | S    |
| 3     | Category budgets + in-app warnings at 80% / 100% ✅                     | M    |
| 3     | Emails: overspending alert, monthly summary (with an on/off setting) ✅ | M    |
| 3     | Savings forecast on the Dashboard ✅                                    | S    |

**Done when:** recurring payments can be fully managed, users get budget warnings, and nobody is locked out by a forgotten password.

### Part 2: Intelligence and insights

⏸ = on hold (your call, 15 Oct 2026): not needed for now.

| Item                                                                              | Size |
| --------------------------------------------------------------------------------- | ---- |
| Year-vs-year compare on Insights ✅                                               | S    |
| Trend advisor: category trends + suggestions ("dining up 40% over 3 months") ⏸    | M    |
| Recurring insights: total committed per month, upcoming 30 days, price changes ✅ | S    |
| CSV / Excel import with column mapping and duplicate detection ⏸                  | L    |
| Export to PDF (monthly report) ⏸                                                  | M    |
| User settings panel (notifications, budgets, defaults) ✅                         | M    |
| Weekly summary email ⏸                                                            | S    |

### Part 3: Growth

| Item                                                                                  | Size |
| ------------------------------------------------------------------------------------- | ---- |
| Accounts (bank, card, cash) + transfers between them                                  | L    |
| Debt tracker: loans, card dues, EMI schedule                                          | M    |
| Receipt upload (photo on a transaction; OCR stays parked)                             | M    |
| Installable app (PWA) + push notifications                                            | M    |
| Two-factor login + active sessions page                                               | M    |
| Separate worker for the daily job and emails (needed before running 2+ API instances) | M    |
| Rename the database from Atlas's default `test` to `budgetwise`                       | S    |

### Parked

Multi-currency · receipt OCR · chatbot assistant · developer API · premium insights module · shared wallets · password-protected export (as specified). Revisit after Part 3, or when users ask.

---

## 4. About password-protected export

The proposed password, **first 4 letters of the name + last 4 digits of the phone** (e.g. `dhee1234`), would not protect anything:

- Anyone who knows the person's name and phone number (family, colleagues, anyone with their contact card) can open the file.
- It can never be changed. If it leaks once, every export is exposed.
- The phone number becomes part of a security secret.

**Recommended instead** (size M):

1. **Re-enter your account password** before any export. This proves it's really the account owner downloading.
2. **Optionally**, let the user type their **own** file password, and encrypt the Excel file with it (or put it in an AES-encrypted ZIP). Show it once and never store it.

This gives real protection and costs about the same to build. Until then, the export is only available to a signed-in user over HTTPS.

---

## 5. Decisions needed from you

1. **Password-protected export:** go with the recommended approach in section 4, or park it?
2. **Editing past months:** today only the current month can be edited. Any month, the last N months, or keep as is?
3. **Premium tier:** stay free, or plan paid features? This decides the insights module and custom labels.
4. **CSV import:** which banks first? Each exports differently.
5. ~~**Emails:** on by default or opt-in?~~ Went with on by default, each type switchable in Settings → Email notifications (one-line change to flip).

---

## 6. How each part ships

1. Build on `development`. Every change comes with tests (from Part 0 on).
2. CI passes, then review locally with the demo account.
3. Merge to `main` and deploy, following `DEPLOY_NOTES.local.md`.
4. Watch errors and uptime for 24 hours, and roll back if needed.
