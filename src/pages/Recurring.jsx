import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { RefreshCw, Pause, Play, Repeat, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../utils/api";
import { money, capitalize } from "../utils/format";
import { formatDay } from "../utils/dates";
import { Card, PageHeader, EmptyState, Skeleton, ConfirmDialog } from "../components/ui";
import { CategoryIcon } from "../components/TransactionList";

const PAGE_SIZE = 10;
// Rough monthly cost of a rule, for the summary
const PER_MONTH = { daily: 30, weekly: 52 / 12, monthly: 1, yearly: 1 / 12 };

export default function Recurring() {
  const [rules, setRules] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [pausing, setPausing] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api(`/recurring/transactions?page=${page}&limit=${PAGE_SIZE}`).then(({ ok, data, error }) => {
      if (!alive) return;
      if (!ok) toast.error(error);
      setRules(ok ? data.data : []);
      setPagination(ok ? data.pagination : {});
      setLoading(false);
    });
    return () => { alive = false; };
  }, [page, refreshKey]);

  const act = async (rule, action) => {
    setBusyId(rule._id);
    const { ok, data, error } = await api(`/recurring/${action}Transaction/${rule._id}`, { method: "POST" });
    setBusyId(null);
    setPausing(null);
    if (!ok) return toast.error(error);
    setRules((list) => list.map((r) => (r._id === rule._id ? { ...r, ...data.data } : r)));
    toast.success(action === "pause" ? "Paused. No new transactions until you resume." : "Resumed");
  };

  const sync = async () => {
    setSyncing(true);
    const { ok, data, error } = await api("/sync", { method: "POST" });
    setSyncing(false);
    if (!ok) return toast.error(error);
    toast.success(data.message);
    setRefreshKey((k) => k + 1);
  };

  const active = rules.filter((r) => r.isActive);
  const monthlyOut = active.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount * (PER_MONTH[r.frequency] || 1), 0);
  const monthlyIn = active.filter((r) => r.type === "income").reduce((s, r) => s + r.amount * (PER_MONTH[r.frequency] || 1), 0);

  return (
    <div>
      <PageHeader
        title="Recurring"
        subtitle="Payments and income that repeat automatically."
        actions={
          <button className="btn btn-sm btn-ghost border-base-300" onClick={sync} disabled={syncing}>
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} /> {syncing ? "Syncing…" : "Sync now"}
          </button>
        }
      />

      {!loading && rules.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <p className="label-muted">Active</p>
            <p className="num mt-1 text-xl font-semibold">{active.length}<span className="text-sm font-normal text-base-content/50"> / {pagination.totalCount ?? rules.length}</span></p>
          </Card>
          <Card className="p-4">
            <p className="label-muted">Going out / month</p>
            <p className="num mt-1 text-xl font-semibold">≈ {money(monthlyOut)}</p>
          </Card>
          <Card className="col-span-2 p-4 sm:col-span-1">
            <p className="label-muted">Coming in / month</p>
            <p className="num mt-1 text-xl font-semibold text-success">≈ {money(monthlyIn)}</p>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : rules.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="Nothing recurring yet"
            text='When you add a transaction, switch on "Repeat automatically" and it will show up here.'
            action={<Link to="/add" className="btn btn-primary btn-sm"><Plus size={16} /> Add transaction</Link>}
          />
        ) : (
          <ul className="divide-y divide-base-300">
            {rules.map((r) => (
              <li key={r._id} className={`flex items-center gap-3 px-4 py-4 sm:px-5 ${r.isActive ? "" : "opacity-60"}`}>
                <CategoryIcon txn={r} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.note || "Recurring transaction"}</p>
                  <p className="mt-0.5 truncate text-xs text-base-content/55">
                    {capitalize(r.frequency)}<span className="hidden sm:inline"> · since {formatDay(r.startDate)}</span>
                    {r.endDate && ` · until ${formatDay(r.endDate)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`num font-semibold ${r.type === "income" ? "text-success" : ""}`}>{r.type === "income" ? "+" : "−"}{money(r.amount, { exact: true })}</p>
                  <p className="text-xs text-base-content/55">{r.isActive && r.nextOccurrence ? `Next: ${formatDay(r.nextOccurrence)}` : "Paused"}</p>
                </div>
                <span className={`badge badge-sm hidden sm:inline-flex ${r.isActive ? "badge-success badge-soft" : "badge-ghost"}`}>{r.isActive ? "Active" : "Paused"}</span>
                <button
                  className="btn btn-sm btn-ghost border-base-300 max-sm:btn-square"
                  disabled={busyId === r._id}
                  onClick={() => (r.isActive ? setPausing(r) : act(r, "resume"))}
                  aria-label={`${r.isActive ? "Pause" : "Resume"} ${r.note || "recurring transaction"}`}
                >
                  {busyId === r._id ? <span className="loading loading-spinner loading-xs" /> : r.isActive ? <Pause size={15} /> : <Play size={15} />}
                  <span className="hidden sm:inline">{r.isActive ? "Pause" : "Resume"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-base-300 px-5 py-3 text-sm">
            <button className="btn btn-sm btn-ghost" disabled={!pagination.hasPreviousPage} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
            <span className="text-base-content/60">Page {page} of {pagination.totalPages}</span>
            <button className="btn btn-sm btn-ghost" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!pausing}
        title="Pause this recurring transaction?"
        message="No new transactions are created while paused. When you resume, it continues from the next date. Missed dates are not added."
        confirmLabel="Pause"
        tone="primary"
        loading={busyId === pausing?._id}
        onConfirm={() => act(pausing, "pause")}
        onCancel={() => setPausing(null)}
      />
    </div>
  );
}
