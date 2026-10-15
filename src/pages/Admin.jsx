import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Users,
  UserPlus,
  Activity,
  ArrowLeftRight,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Search,
  Check,
  Eye,
  Target,
  Repeat,
  Wallet,
} from "lucide-react";
import { api } from "../utils/api";
import { formatDay } from "../utils/dates";
import { MONTHS } from "../utils/format";
import {
  Card,
  CardHeader,
  PageHeader,
  StatCard,
  Segmented,
  EmptyState,
  Skeleton,
} from "../components/ui";

const TYPES = [
  { value: "", label: "All types" },
  { value: "bug", label: "Bugs" },
  { value: "feature", label: "Ideas" },
  { value: "suggestion", label: "Suggestions" },
  { value: "other", label: "Other" },
];
const TYPE_BADGE = {
  bug: "badge-error",
  feature: "badge-primary",
  suggestion: "badge-info",
  other: "badge-ghost",
};
const STATUS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "seen", label: "Seen" },
  { value: "done", label: "Done" },
];
const STATUS_BADGE = {
  new: "badge-warning",
  seen: "badge-info",
  done: "badge-success",
};
const shortDate = (d) => (d ? formatDay(d) : "—");

function Pager({ page, totalPages, onPage }) {
  if (!totalPages || totalPages < 2) return null;
  return (
    <div className="flex items-center justify-between border-t border-base-300 px-5 py-3 text-sm">
      <button
        className="btn btn-sm btn-ghost"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft size={16} /> Previous
      </button>
      <span className="text-base-content/60">
        Page {page} of {totalPages}
      </span>
      <button
        className="btn btn-sm btn-ghost"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}

function MiniBars({ data, xKey, label }) {
  return (
    <div className="h-52 w-full text-base-content/45">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="currentColor"
            strokeOpacity={0.15}
          />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "currentColor", fillOpacity: 0.06 }}
            formatter={(v) => [v, label]}
            contentStyle={{ borderRadius: 12 }}
          />
          <Bar
            dataKey="count"
            fill="#6366f1"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Overview({ stats }) {
  const [activity, setActivity] = useState(null);
  useEffect(() => {
    api("/admin/activity").then(({ ok, data, error }) =>
      ok ? setActivity(data) : toast.error(error)
    );
  }, []);

  const weeks = activity?.signupsPerWeek.map((w) => ({
    ...w,
    label: formatDay(w.weekStart, { year: undefined }),
  }));
  const months = activity?.activePerMonth.map((m) => ({
    ...m,
    label: MONTHS[Number(m.month.slice(5)) - 1].slice(0, 3),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats ? (
          <>
            <StatCard label="Users" icon={Users} value={stats.users} />
            <StatCard
              label="New this week"
              icon={UserPlus}
              tone="success"
              value={stats.newThisWeek}
            />
            <StatCard
              label="Active (30 days)"
              icon={Activity}
              tone="violet"
              value={stats.activeLast30Days}
              footer={
                <span className="text-xs text-base-content/50">
                  Added a transaction
                </span>
              }
            />
            <StatCard
              label="Transactions"
              icon={ArrowLeftRight}
              value={stats.transactions.toLocaleString("en-IN")}
            />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Sign-ups" subtitle="Per week, last 12 weeks" />
          <div className="px-3 pt-2 pb-4">
            {weeks ? (
              <MiniBars data={weeks} xKey="label" label="Sign-ups" />
            ) : (
              <Skeleton className="mx-2 h-52" />
            )}
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Active users"
            subtitle="Added a transaction, per month"
          />
          <div className="px-3 pt-2 pb-4">
            {months ? (
              <MiniBars data={months} xKey="label" label="Active users" />
            ) : (
              <Skeleton className="mx-2 h-52" />
            )}
          </div>
        </Card>
      </div>

      {activity && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            [Target, "Savings goals", activity.totals.goals],
            [
              Repeat,
              "Active recurring payments",
              activity.totals.activeRecurring,
            ],
            [Wallet, "Users with budgets", activity.totals.usersWithBudgets],
          ].map(([Icon, label, value]) => (
            <Card key={label} className="flex items-center gap-4 p-4">
              <span className="grid size-10 grid-cols-1 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon size={18} />
              </span>
              <div>
                <p className="label-muted">{label}</p>
                <p className="num text-xl font-semibold">{value}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      const q = new URLSearchParams({
        page,
        limit: 15,
        ...(query.trim() && { search: query.trim() }),
      });
      api(`/admin/users?${q}`).then(({ ok, data, error }) => {
        if (!alive) return;
        if (!ok) toast.error(error);
        setResult(ok ? data : { data: [], pagination: {} });
      });
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, page]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <label className="input w-full sm:w-80">
          <Search size={16} className="text-base-content/40" />
          <input
            type="search"
            placeholder="Search name or email"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            aria-label="Search users"
          />
        </label>
        <span className="text-sm text-base-content/60">
          {result ? `${result.pagination.total ?? 0} users` : "Loading…"}
        </span>
      </div>
      {!result ? (
        <div className="space-y-3 p-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : result.data.length === 0 ? (
        <EmptyState icon={Users} title="No users match" />
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Joined</th>
                <th>Last sign-in</th>
                <th className="text-right">Transactions</th>
                <th>Last transaction</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-2 font-medium capitalize">
                      {u.name}
                      {u.role === "admin" && (
                        <span className="badge badge-primary badge-soft badge-xs normal-case">
                          admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-base-content/55">
                      {u.email}
                    </div>
                  </td>
                  <td className="whitespace-nowrap">{shortDate(u.joinedAt)}</td>
                  <td className="whitespace-nowrap">
                    {shortDate(u.lastLoginAt)}
                  </td>
                  <td className="num text-right">{u.transactions}</td>
                  <td className="whitespace-nowrap">
                    {shortDate(u.lastTransactionAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager
        page={page}
        totalPages={result?.pagination.totalPages}
        onPage={setPage}
      />
    </Card>
  );
}

function FeedbackItem({ item, onChanged }) {
  const [note, setNote] = useState(item.adminNote);
  const [busy, setBusy] = useState(false);

  const update = async (body, success) => {
    setBusy(true);
    const r = await api(`/admin/feedback/${item._id}`, {
      method: "PATCH",
      body,
    });
    setBusy(false);
    if (!r.ok) return toast.error(r.error);
    toast.success(success, { id: "feedback" });
    onChanged({ ...item, ...r.data.data });
  };

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/55">
        <span
          className={`badge badge-sm badge-soft ${STATUS_BADGE[item.status]}`}
        >
          {item.status}
        </span>
        <span
          className={`badge badge-sm badge-soft ${TYPE_BADGE[item.type] || "badge-ghost"}`}
        >
          {TYPES.find((t) => t.value === item.type)?.label || item.type}
        </span>
        <span>
          {item.user
            ? `${item.user.name} · ${item.user.email}`
            : "Deleted account"}
        </span>
        <span>· {formatDay(item.createdAt)}</span>
      </div>
      <p className="mt-2 whitespace-pre-line">{item.text}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className="input input-sm w-full sm:flex-1"
          placeholder="Private note (only admins see it)"
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && update({ note }, "Note saved")}
          aria-label="Admin note"
        />
        <div className="flex gap-2">
          {note !== item.adminNote && (
            <button
              className="btn btn-sm"
              disabled={busy}
              onClick={() => update({ note }, "Note saved")}
            >
              Save note
            </button>
          )}
          {item.status === "new" && (
            <button
              className="btn btn-sm btn-ghost border-base-300"
              disabled={busy}
              onClick={() => update({ status: "seen" }, "Marked as seen")}
              aria-label="Mark as seen"
            >
              <Eye size={15} /> Seen
            </button>
          )}
          {item.status !== "done" ? (
            <button
              className="btn btn-sm btn-success btn-soft"
              disabled={busy}
              onClick={() => update({ status: "done" }, "Marked as done")}
              aria-label="Mark as done"
            >
              <Check size={15} /> Done
            </button>
          ) : (
            <button
              className="btn btn-sm btn-ghost"
              disabled={busy}
              onClick={() => update({ status: "new" }, "Reopened")}
              aria-label="Reopen"
            >
              Reopen
            </button>
          )}
        </div>
      </div>
      {item.handledAt && (
        <p className="mt-1 text-[11px] text-base-content/45">
          Updated {formatDay(item.handledAt)}
        </p>
      )}
    </li>
  );
}

function FeedbackTab({ newCount, onCountsChanged }) {
  const [status, setStatus] = useState("new");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let alive = true;
    setResult(null);
    const q = new URLSearchParams({
      page,
      limit: 10,
      ...(type && { type }),
      ...(status && { status }),
    });
    api(`/admin/feedback?${q}`).then(({ ok, data, error }) => {
      if (!alive) return;
      if (!ok) toast.error(error);
      setResult(ok ? data : { data: [], pagination: {} });
    });
    return () => {
      alive = false;
    };
  }, [status, type, page]);

  const changed = (updated) => {
    setResult((r) => ({
      ...r,
      data: r.data.map((f) => (f._id === updated._id ? updated : f)),
    }));
    onCountsChanged();
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <Segmented
          label="Feedback status"
          size="sm"
          options={STATUS.map((s) => ({
            value: s.value,
            label:
              s.value === "new" && newCount ? `New (${newCount})` : s.label,
          }))}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <select
          className="select select-sm w-40"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          aria-label="Feedback type"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      {!result ? (
        <div className="space-y-3 p-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : result.data.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={status === "new" ? "Nothing new" : "No feedback here"}
          text={status === "new" ? "You're all caught up." : undefined}
        />
      ) : (
        <ul className="divide-y divide-base-300 border-t border-base-300">
          {result.data.map((f) => (
            <FeedbackItem key={f._id} item={f} onChanged={changed} />
          ))}
        </ul>
      )}
      <Pager
        page={page}
        totalPages={result?.pagination.totalPages}
        onPage={setPage}
      />
    </Card>
  );
}

// Admin area: usage overview, users and feedback triage
export default function Admin() {
  const isAdmin = useSelector((s) => s.profile.currentUser?.role === "admin");
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [statsVersion, setStatsVersion] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    api("/admin/stats").then(({ ok, data, error }) =>
      ok ? setStats(data) : toast.error(error)
    );
  }, [isAdmin, statsVersion]);

  if (!isAdmin) {
    return (
      <Card>
        <EmptyState
          icon={ShieldAlert}
          title="Admins only"
          text="This page is only available to administrators."
        />
      </Card>
    );
  }

  const newCount = stats?.feedback.new;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        subtitle="How BudgetWise is being used, and what users are telling you."
      />
      <Segmented
        label="Admin section"
        options={[
          { value: "overview", label: "Overview" },
          { value: "users", label: "Users" },
          {
            value: "feedback",
            label: newCount ? `Feedback (${newCount} new)` : "Feedback",
          },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "overview" && <Overview stats={stats} />}
      {tab === "users" && <UsersTab />}
      {tab === "feedback" && (
        <FeedbackTab
          newCount={newCount}
          onCountsChanged={() => setStatsVersion((v) => v + 1)}
        />
      )}
    </div>
  );
}
