import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Wallet,
  ArrowDownLeft,
  ShoppingBag,
  PiggyBank,
  Download,
  Plus,
  Inbox,
  Repeat,
  Target,
  ChevronRight,
} from "lucide-react";
import { addTransaction } from "../utils/redux/transactionSlice";
import { api } from "../utils/api";
import { BASE_URL } from "../utils/constants";
import { money, change, percent, MONTHS, capitalize } from "../utils/format";
import { isIncome, isSpending, isSavings } from "../utils/categories";
import { formatDay } from "../utils/dates";
import {
  Card,
  CardHeader,
  StatCard,
  Delta,
  EmptyState,
  Skeleton,
  PageHeader,
} from "../components/ui";
import TransactionList from "../components/TransactionList";
import ForecastCard from "../components/ForecastCard";
import { BudgetBars, BudgetAlerts, BudgetsModal } from "../components/Budgets";
import SpendingTrend from "../components/charts/SpendingTrend";
import CategoryDonut from "../components/charts/CategoryDonut";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

// 50/30/20 guide: needs ≤ 50%, wants ≤ 30%, savings + investments ≥ 20% of income
function BudgetGuide({ income, needs, wants, saved }) {
  const rows = [
    {
      label: "Needs",
      value: needs,
      target: 50,
      max: true,
      color: "bg-emerald-500",
    },
    {
      label: "Wants",
      value: wants,
      target: 30,
      max: true,
      color: "bg-amber-500",
    },
    {
      label: "Savings & investments",
      value: saved,
      target: 20,
      max: false,
      color: "bg-violet-500",
    },
  ];
  if (!income) {
    return (
      <p className="label-muted px-5 pb-5">
        Add this month’s income to see how your spending compares with the
        50/30/20 guide.
      </p>
    );
  }
  return (
    <div className="space-y-5 px-5 pb-5">
      {rows.map((r) => {
        const pct = (r.value / income) * 100;
        const off = r.max ? pct > r.target : pct < r.target;
        return (
          <div key={r.label}>
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span className="font-medium">{r.label}</span>
              <span className="num">
                <span
                  className={
                    off ? "font-semibold text-warning" : "font-semibold"
                  }
                >
                  {percent(pct)}
                </span>
                <span className="text-base-content/50">
                  {" "}
                  / {r.max ? "≤" : "≥"}
                  {r.target}%
                </span>
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-base-200">
              <div
                className={`h-full rounded-full ${off ? "bg-warning" : r.color}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
              <div
                className="absolute inset-y-0 w-0.5 bg-base-content/40"
                style={{ left: `${r.target}%` }}
                title={`Target ${r.target}%`}
              />
            </div>
            <p className="num mt-1 text-xs text-base-content/50">
              {money(r.value)} of {money(income)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.profile.currentUser);
  const transactions = useSelector((s) => s.transaction.transactions);

  const [months, setMonths] = useState(null); // [{year, month}]
  const [selected, setSelected] = useState(null); // "YYYY-M"
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [summary, setSummary] = useState([]);
  const [goals, setGoals] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  // Months that have data, plus side panels
  useEffect(() => {
    let alive = true;
    (async () => {
      const [m, s, g, r] = await Promise.all([
        api("/user/transaction/dataMonthList"),
        api("/insights/monthlySummary"),
        api("/goal/list"),
        api("/recurring/transactions?limit=20"),
      ]);
      if (!alive) return;
      const list = (m.data?.data || []).map(({ month, year }) => ({
        year,
        month: MONTHS.indexOf(month) + 1,
      }));
      const now = new Date();
      const thisMonth = { year: now.getFullYear(), month: now.getMonth() + 1 };
      // Always offer the current month, even before its first transaction
      if (
        !list.some(
          (x) => x.year === thisMonth.year && x.month === thisMonth.month
        )
      )
        list.unshift(thisMonth);
      setMonths(list);
      setSelected(`${thisMonth.year}-${thisMonth.month}`);
      setSummary(s.data?.summary || []);
      setGoals((g.data?.goals || []).filter((x) => !x.isCompleted).slice(0, 3));
      setUpcoming(
        (r.data?.data || [])
          .filter((x) => x.isActive && x.nextOccurrence)
          .sort(
            (a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence)
          )
          .slice(0, 4)
      );
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [year, month] = selected ? selected.split("-").map(Number) : [0, 0];

  useEffect(() => {
    if (!selected) return;
    let alive = true;
    setLoadingMonth(true);
    api(`/user/transactions/monthly?month=${month}&year=${year}`).then(
      ({ ok, data, error }) => {
        if (!alive) return;
        if (!ok) toast.error(error);
        dispatch(addTransaction(ok ? data.data.transactions : []));
        setLoadingMonth(false);
      }
    );
    return () => {
      alive = false;
    };
  }, [selected, year, month, dispatch]);

  // Category budgets for the month shown (refreshed when transactions change)
  const [budgets, setBudgets] = useState(null);
  const [editingBudgets, setEditingBudgets] = useState(false);
  useEffect(() => {
    if (!selected) return;
    let alive = true;
    api(`/budgets?year=${year}&month=${month}`).then(
      ({ ok, data }) => alive && ok && setBudgets(data.data)
    );
    return () => {
      alive = false;
    };
  }, [selected, year, month, transactions]);
  const hasBudgets = budgets?.some((b) => b.limit);

  const totals = useMemo(() => {
    const sum = (fn, filter) =>
      transactions.filter(filter).reduce((s, t) => s + fn(t), 0);
    const amt = (t) => t.amount;
    const income = sum(amt, isIncome);
    const spending = sum(amt, isSpending);
    const saved = sum(amt, isSavings);
    return {
      income,
      spending,
      saved,
      left: income - spending - saved,
      needs: sum(amt, (t) => isSpending(t) && t.category === "need"),
      wants: sum(amt, (t) => isSpending(t) && t.category === "want"),
      invested: sum(amt, (t) => isSpending(t) && t.category === "investment"),
    };
  }, [transactions]);

  const prev = useMemo(() => {
    const py = month === 1 ? year - 1 : year;
    const pm = month === 1 ? 12 : month - 1;
    return summary.find((s) => s.year === py && s.monthNumber === pm) || null;
  }, [summary, year, month]);

  const exportExcel = async () => {
    const res = await fetch(
      `${BASE_URL}/user/transactions/export/excel?month=${month}&year=${year}`,
      { credentials: "include" }
    );
    if (!res.ok)
      return toast.error(
        res.status === 404
          ? "No transactions to export for this month."
          : "Export failed. Please try again."
      );
    const url = URL.createObjectURL(await res.blob());
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `budgetwise_${year}-${String(month).padStart(2, "0")}.xlsx`,
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Excel file downloaded");
  };

  if (months === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const monthLabel = `${MONTHS[month - 1]} ${year}`;
  const isCurrent =
    selected === `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${capitalize(user?.firstName)}`}
        subtitle={
          isCurrent
            ? "Here's where your money stands this month."
            : `Looking back at ${monthLabel}.`
        }
        actions={
          <>
            <select
              className="select select-sm w-44"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              aria-label="Month"
            >
              {months.map((m) => (
                <option
                  key={`${m.year}-${m.month}`}
                  value={`${m.year}-${m.month}`}
                >
                  {MONTHS[m.month - 1]} {m.year}
                </option>
              ))}
            </select>
            <button
              className="btn btn-sm btn-ghost border-base-300"
              onClick={exportExcel}
            >
              <Download size={16} /> Export
            </button>
          </>
        }
      />

      {isCurrent && budgets && <BudgetAlerts rows={budgets} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Left this month"
          icon={Wallet}
          tone="primary"
          value={loadingMonth ? "…" : money(totals.left)}
          footer={
            <span className="text-xs text-base-content/50">
              After spending and savings
            </span>
          }
        />
        <StatCard
          label="Income"
          icon={ArrowDownLeft}
          tone="success"
          value={loadingMonth ? "…" : money(totals.income)}
          footer={<Delta value={change(totals.income, prev?.income)} />}
        />
        <StatCard
          label="Spending"
          icon={ShoppingBag}
          tone="error"
          value={loadingMonth ? "…" : money(totals.spending)}
          footer={
            <Delta
              value={change(totals.spending, prev?.expense)}
              goodWhenUp={false}
            />
          }
        />
        <StatCard
          label="Saved to goals"
          icon={PiggyBank}
          tone="violet"
          value={loadingMonth ? "…" : money(totals.saved)}
          footer={
            <span className="text-xs text-base-content/50">
              {totals.income
                ? `${percent((totals.saved / totals.income) * 100)} of income`
                : "—"}
            </span>
          }
        />
      </div>

      {!loadingMonth && transactions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title={`No transactions in ${monthLabel}`}
            text="Add your income and expenses to see your trends, budget and insights here."
            action={
              <Link to="/add" className="btn btn-primary">
                <Plus size={18} /> Add transaction
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Daily spending" subtitle={monthLabel} />
              <div className="px-3 pb-4 pt-2">
                {loadingMonth ? (
                  <Skeleton className="mx-2 h-64" />
                ) : (
                  <SpendingTrend
                    transactions={transactions}
                    year={year}
                    month={month}
                  />
                )}
              </div>
            </Card>
            <Card>
              <CardHeader
                title={hasBudgets ? "Budgets" : "Budget guide"}
                subtitle={
                  hasBudgets
                    ? `${monthLabel} spending vs your limits`
                    : "50 / 30 / 20 rule"
                }
                action={
                  budgets && (
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => setEditingBudgets(true)}
                    >
                      {hasBudgets ? "Edit" : "Set budgets"}
                    </button>
                  )
                }
              />
              <div className="pt-5">
                {hasBudgets ? (
                  <BudgetBars rows={budgets} />
                ) : (
                  <BudgetGuide
                    income={totals.income}
                    needs={totals.needs}
                    wants={totals.wants}
                    saved={totals.saved + totals.invested}
                  />
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Where it went"
                subtitle="Money out by category"
              />
              <div className="p-5">
                {loadingMonth ? (
                  <Skeleton className="h-44" />
                ) : (
                  <CategoryDonut transactions={transactions} />
                )}
              </div>
            </Card>
            {isCurrent && <ForecastCard refreshKey={transactions} />}
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Recent activity"
                action={
                  <Link to="/transactions" className="btn btn-ghost btn-xs">
                    View all <ChevronRight size={14} />
                  </Link>
                }
              />
              <div className="mt-3 overflow-hidden rounded-b-box">
                {loadingMonth ? (
                  <Skeleton className="m-5 h-40" />
                ) : (
                  <TransactionList transactions={transactions} limit={6} />
                )}
              </div>
            </Card>
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader
                  title="Upcoming payments"
                  action={
                    <Link to="/recurring" className="btn btn-ghost btn-xs">
                      All <ChevronRight size={14} />
                    </Link>
                  }
                />
                {upcoming.length ? (
                  <ul className="divide-y divide-base-300 pt-2">
                    {upcoming.map((r) => (
                      <li
                        key={r._id}
                        className="flex items-center gap-3 px-5 py-3"
                      >
                        <span className="grid grid-cols-1 size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Repeat size={16} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {r.note || "Recurring payment"}
                          </p>
                          <p className="text-xs text-base-content/50">
                            {formatDay(r.nextOccurrence)}
                          </p>
                        </div>
                        <span
                          className={`num text-sm font-semibold ${r.type === "income" ? "text-success" : ""}`}
                        >
                          {money(r.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={Repeat}
                    title="No upcoming payments"
                    text="Mark a transaction as recurring to see it here."
                  />
                )}
              </Card>
              <Card>
                <CardHeader
                  title="Goals"
                  action={
                    <Link to="/goals" className="btn btn-ghost btn-xs">
                      All <ChevronRight size={14} />
                    </Link>
                  }
                />
                {goals.length ? (
                  <ul className="space-y-5 p-5">
                    {goals.map((g) => {
                      const pct = Math.min(
                        (g.currentAmount / g.targetAmount) * 100,
                        100
                      );
                      return (
                        <li key={g._id}>
                          <div className="mb-1.5 flex justify-between text-sm">
                            <span className="truncate font-medium">
                              {g.title}
                            </span>
                            <span className="num text-base-content/60">
                              {percent(pct)}
                            </span>
                          </div>
                          <progress
                            className="progress progress-primary h-2 w-full"
                            value={pct}
                            max="100"
                          />
                          <p className="num mt-1 text-xs text-base-content/50">
                            {money(g.currentAmount)} of {money(g.targetAmount)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <EmptyState
                    icon={Target}
                    title="No active goals"
                    action={
                      <Link to="/goals" className="btn btn-sm btn-primary">
                        Create a goal
                      </Link>
                    }
                  />
                )}
              </Card>
            </div>
          </div>
        </>
      )}
      {editingBudgets && (
        <BudgetsModal
          open
          rows={budgets}
          income={totals.income}
          onClose={() => setEditingBudgets(false)}
          onSaved={(rows) => {
            // saved rows are for the current month; refetch if another is shown
            if (isCurrent) setBudgets(rows);
            else
              api(`/budgets?year=${year}&month=${month}`).then(
                ({ ok, data }) => ok && setBudgets(data.data)
              );
            setEditingBudgets(false);
          }}
        />
      )}
    </div>
  );
}
