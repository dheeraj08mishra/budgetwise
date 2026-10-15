# 💰 BudgetWise

A personal finance tracker: record income and expenses, see where the money goes, keep budgets, automate recurring payments and save towards goals.

This repo is the **React frontend**. What's planned next: [ROADMAP.md](ROADMAP.md). The API lives in [finance_tracker_server](https://github.com/dheeraj08mishra/finance_tracker_server) (Express + MongoDB).

---

## ✨ Features

- **Accounts**: sign up / log in with an httpOnly session cookie
- **Transactions**: add, edit, delete (with confirmation); search, filter by category and date, sort; grouped by day; notes are auto-tagged (OpenAI)
- **Dashboard**: month at a glance (left, income, spending, saved vs last month), daily spending, 50/30/20 budget guide, category breakdown, upcoming payments, goals
- **Insights**: income vs spending by month with anomaly detection (previous month, rolling average or z-score)
- **Recurring transactions**: daily / weekly / monthly / yearly, with pause, resume and sync; email reminders
- **Goals**: save towards a target; contributions are tracked as savings
- **Export** a month to Excel
- Light / dark theme (follows your OS by default), desktop sidebar and mobile tab bar

## 🔧 Tech stack

|        |                                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------------- |
| UI     | React 19, React Router 7, Tailwind CSS 4 + daisyUI 5 (custom light/dark themes), Lucide icons, Inter |
| State  | Redux Toolkit                                                                                        |
| Charts | Recharts                                                                                             |
| Dates  | date-fns                                                                                             |
| Build  | Vite 6                                                                                               |

## 🛠️ Running locally

You need the API running first (see the server repo). Then:

```bash
git clone https://github.com/dheeraj08mishra/budgetwise.git
cd budgetwise
npm install

# API on port 3000 (default):
npm run dev

# API on another port:
API_PROXY_TARGET=http://localhost:3001 npm run dev
```

Open http://localhost:1234. The dev server proxies `/api` to the Express server, the same way nginx does in production, so the app never needs CORS or a hard-coded API URL.

## 📦 Production build

```bash
npm run build      # outputs to build/
npm run preview    # serve the build locally (also proxies /api)
```

In production the app calls the API at `/api` on the same domain (nginx proxies `/api` to the Express server). Set `VITE_API_URL` at build time to call an API elsewhere.

## ✅ Checks

```bash
npm run lint           # ESLint (React + hooks rules)
npm run format:check   # Prettier (npm run format to fix)
npm test               # unit tests for the helpers (node:test)
npm run test:e2e       # 17 end-to-end flows in Chrome (Playwright)
```

`test:e2e` drives the real app, so it needs the local stack running: the API with a local MongoDB and the demo account (`npm run seed:demo` in the server repo), plus `npm run dev` here. Start the API with high rate limits for test runs (`AUTH_RATE_LIMIT=500 API_RATE_LIMIT=10000`), and set `E2E_SERVER_LOG` to the API's log file so the forgot-password flow can read the reset link the server prints locally. The flows change the demo data, so re-seed afterwards. GitHub Actions runs lint, format check, unit tests and the build on every push.

## 📁 Project layout

```
index.html          entry page
src/
  main.jsx          bootstraps React, theme and font
  index.css         Tailwind + the two daisyUI themes (bw-light, bw-dark)
  pages/            one lazily loaded file per route
  components/       app shell, shared UI kit (ui.jsx), transaction list, charts/
  utils/
    api.js          fetch wrapper (errors, expired sessions)
    format.js       ₹ formatting
    categories.js   category labels, icons, colours
    dates.js        local "today" and UTC-safe date display
    redux/          store and slices
test/               unit tests
e2e/                browser flows
```
