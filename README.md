# 💰 BudgetWise

A personal finance tracker: record income and expenses, see where the money goes, keep budgets, automate recurring payments and save towards goals.

This repo is the **React frontend**. The API lives in [finance_tracker_server](https://github.com/dheeraj08mishra/finance_tracker_server) (Express + MongoDB).

---

## ✨ Features

- **Accounts**: sign up / log in with an httpOnly session cookie
- **Transactions**: add, edit, delete; notes are auto-tagged (OpenAI)
- **Dashboard**: monthly balance, category pie chart, budget bars, day-wise spending trend
- **Insights**: income vs spending by month with anomaly detection (previous month, rolling average or z-score)
- **Recurring transactions**: daily / weekly / monthly / yearly, with pause, resume and sync; email reminders
- **Goals**: save towards a target; contributions are tracked as savings
- **History**: search by note, filter by category and date range, sort, paginate
- **Export** a month to Excel
- Light / dark theme, responsive layout

## 🔧 Tech stack

| | |
|---|---|
| UI | React 19, React Router 7, Tailwind CSS 4 + daisyUI 5, Framer Motion |
| State | Redux Toolkit |
| Charts | Recharts |
| Dates | date-fns |
| Bundler | Parcel 2 |

## 🛠️ Running locally

You need the API running first (see the server repo). Then:

```bash
git clone https://github.com/dheeraj08mishra/budgetwise.git
cd budgetwise
npm install

# API on port 3000 (default):
npm start

# API on another port:
API_URL=http://localhost:3001 npm start
```

Open http://localhost:1234.

## 📦 Production build

```bash
npm run build      # outputs to build/
```

In production the app calls the API at `/api` on the same domain (nginx proxies `/api` to the Express server). Set `API_URL` at build time to point somewhere else.

## 📁 Project layout

```
src/
  components/     pages and UI pieces (Dashboard = MainContainer)
  utils/
    redux/        store and slices
    constants.js  API base URL
    dates.js      local "today" and UTC-safe date display
  index.html, index.js, index.css
```

## 📸 Screenshots

### Home
![image](https://github.com/user-attachments/assets/e608f611-307a-488a-ae26-23103cefbde8)
![image](https://github.com/user-attachments/assets/63fc38b0-9739-40c2-83c9-160564cd76bd)
![image](https://github.com/user-attachments/assets/a8106ae0-36a3-4606-9de5-e290286e9566)

### Add transaction
![image](https://github.com/user-attachments/assets/06cb6d3a-9c9c-4eb1-a79f-9586c1c30b28)
![image](https://github.com/user-attachments/assets/8eb2ae51-8d94-4763-ae76-7571d49a5101)

### Login
![image](https://github.com/user-attachments/assets/5e851466-3d8e-4319-b4d7-b05a3d40a882)
