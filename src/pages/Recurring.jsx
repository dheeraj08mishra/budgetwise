import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  RefreshCw,
  Pause,
  Play,
  Repeat,
  Plus,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Pencil,
  SkipForward,
  Trash2,
  TrendingUp,
  TrendingDown,
  CalendarClock,
} from "lucide-react";
import { api } from "../utils/api";
import { money } from "../utils/format";
import { formatDay, todayString } from "../utils/dates";
import { EXPENSE_CATEGORIES, CATEGORIES } from "../utils/categories";
import { frequencyLabel } from "../utils/frequency";
import {
  Card,
  PageHeader,
  EmptyState,
  Skeleton,
  ConfirmDialog,
  Modal,
  Field,
  Segmented,
} from "../components/ui";
import { CategoryIcon } from "../components/TransactionList";
import FrequencyPicker from "../components/FrequencyPicker";

const PAGE_SIZE = 10;
// daisyUI dropdowns stay open while focused: blur to close after a choice
const closeMenu = () => document.activeElement?.blur();
const dayOf = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

// Edit a series: changes apply to future payments only
function EditRuleModal({ rule, onClose, onSaved }) {
  const [form, setForm] = useState({
    type: rule.type,
    amount: String(rule.amount),
    category: rule.category,
    note: rule.note || "",
    frequency: rule.frequency,
    endDate: dayOf(rule.endDate),
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const amount = parseFloat(form.amount);
    if (!(amount > 0)) return toast.error("Amount must be a positive number.");
    if (form.endDate && form.endDate < dayOf(rule.startDate)) {
      return toast.error("The end date can't be before the start date.");
    }
    setSaving(true);
    const { ok, data, error } = await api(
      `/recurring/transaction/${rule._id}`,
      {
        method: "PATCH",
        body: {
          ...form,
          amount: Math.round(amount * 100) / 100,
          endDate: form.endDate || null,
        },
      }
    );
    setSaving(false);
    if (!ok) return toast.error(error);
    toast.success(
      data.data.isActive || !rule.isActive
        ? "Recurring payment updated. Applies to future payments."
        : "Updated. The end date has passed, so this series has ended."
    );
    onSaved(data.data);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit recurring payment"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving && <span className="loading loading-spinner loading-sm" />}
            Save changes
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="rounded-field bg-base-200 px-3 py-2 text-xs text-base-content/70">
          Changes apply to future payments. Transactions already added stay as
          they are.
        </p>
        <Segmented
          label="Type"
          options={[
            { value: "expense", label: "Expense" },
            { value: "income", label: "Income" },
          ]}
          value={form.type}
          onChange={set("type")}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Amount" htmlFor="rule-amount">
            <label className="input w-full">
              <span className="text-base-content/50">₹</span>
              <input
                id="rule-amount"
                inputMode="decimal"
                className="num"
                value={form.amount}
                onChange={(e) =>
                  /^\d*(\.\d{0,2})?$/.test(e.target.value) &&
                  set("amount")(e.target.value)
                }
              />
            </label>
          </Field>
          {form.type === "expense" && (
            <Field label="Category" htmlFor="rule-category">
              <select
                id="rule-category"
                className="select w-full"
                value={form.category}
                onChange={(e) => set("category")(e.target.value)}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIES[c].label}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
        <Field label="Note" htmlFor="rule-note">
          <input
            id="rule-note"
            className="input w-full"
            maxLength={200}
            value={form.note}
            onChange={(e) => set("note")(e.target.value)}
          />
        </Field>
        <div>
          <p className="mb-2 text-sm font-medium">Repeats</p>
          <FrequencyPicker value={form.frequency} onChange={set("frequency")} />
          {form.frequency !== rule.frequency && (
            <p className="mt-2 text-xs text-base-content/55">
              The new schedule starts after today, keeping{" "}
              {formatDay(rule.startDate, { year: undefined })} as its anchor.
            </p>
          )}
        </div>
        <Field
          label="Ends on"
          hint="Optional. Leave empty to repeat until you stop it."
          htmlFor="rule-end"
        >
          <div className="flex gap-2">
            <input
              id="rule-end"
              type="date"
              className="input w-full sm:w-56"
              value={form.endDate}
              min={dayOf(rule.startDate)}
              onChange={(e) => set("endDate")(e.target.value)}
            />
            {form.endDate && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => set("endDate")("")}
              >
                Clear
              </button>
            )}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

const shortDay = (d) => formatDay(d, { year: undefined });

// "Netflix went up from ₹499 to ₹649 (+30%) on 7 Aug"
function PriceChanges({ changes }) {
  if (!changes?.length) return null;
  return (
    <ul className="mb-6 space-y-2" aria-label="Price changes">
      {changes.map((c) => {
        const up = c.to > c.from;
        // paying more is bad news; earning more is good news
        const good = up === (c.type === "income");
        const Icon = up ? TrendingUp : TrendingDown;
        const pct =
          c.percent !== null
            ? ` (${up ? "+" : "−"}${Math.round(Math.abs(c.percent))}%)`
            : "";
        const name = c.note || "A recurring payment";
        return (
          <li
            key={c.ruleId}
            className={`flex items-start gap-3 rounded-box border px-4 py-3 text-sm ${good ? "border-success/30 bg-success/10" : "border-warning/40 bg-warning/10"}`}
          >
            <Icon
              size={18}
              className={`mt-0.5 shrink-0 ${good ? "text-success" : "text-warning"}`}
              aria-hidden
            />
            <p>
              {c.kind === "upcoming" ? (
                <>
                  <span className="font-medium">{name}</span> will be{" "}
                  <span className="num font-medium">{money(c.to)}</span> from{" "}
                  {shortDay(c.date)}, was{" "}
                  <span className="num">{money(c.from)}</span>
                  {pct}.
                </>
              ) : (
                <>
                  <span className="font-medium">{name}</span> went{" "}
                  {up ? "up" : "down"} from{" "}
                  <span className="num">{money(c.from)}</span> to{" "}
                  <span className="num font-medium">{money(c.to)}</span>
                  {pct} on {shortDay(c.date)}.
                </>
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

const UPCOMING_SHOWN = 6;

// Every payment due in the next 30 days, soonest first
function Upcoming({ upcoming }) {
  const [all, setAll] = useState(false);
  if (!upcoming) return null;
  const items = all ? upcoming.items : upcoming.items.slice(0, UPCOMING_SHOWN);
  const totals = [
    upcoming.expense > 0 && `${money(upcoming.expense)} going out`,
    upcoming.income > 0 && `${money(upcoming.income)} coming in`,
  ].filter(Boolean);
  return (
    <Card className="mb-6">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h2 className="text-base font-semibold">Next {upcoming.days} days</h2>
          <p className="label-muted mt-0.5">
            {upcoming.count === 0
              ? "Nothing due."
              : `${upcoming.count} payment${upcoming.count === 1 ? "" : "s"} · ${totals.join(" · ")}`}
          </p>
        </div>
        <CalendarClock size={20} className="text-base-content/40" aria-hidden />
      </div>
      {upcoming.count > 0 && (
        <ul className="mt-3 divide-y divide-base-300">
          {items.map((u) => (
            <li
              key={`${u.ruleId}-${u.date}`}
              className="flex items-center gap-3 px-5 py-3"
            >
              <span className="w-14 shrink-0 text-xs font-medium text-base-content/60">
                {shortDay(u.date)}
              </span>
              <CategoryIcon txn={u} />
              <span className="min-w-0 flex-1 truncate text-sm">
                {u.note || "Recurring transaction"}
              </span>
              <span
                className={`num text-sm font-semibold ${u.type === "income" ? "text-success" : ""}`}
              >
                {u.type === "income" ? "+" : "−"}
                {money(u.amount, { exact: true })}
              </span>
            </li>
          ))}
        </ul>
      )}
      {upcoming.items.length > UPCOMING_SHOWN && (
        <div className="border-t border-base-300 px-5 py-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setAll((v) => !v)}
          >
            {all ? "Show fewer" : `Show all ${upcoming.items.length}`}
          </button>
          {all && upcoming.count > upcoming.items.length && (
            <span className="text-xs text-base-content/55">
              Showing the first {upcoming.items.length}.
            </span>
          )}
        </div>
      )}
      {upcoming.count === 0 && <div className="pb-5" />}
    </Card>
  );
}

export default function Recurring() {
  const [rules, setRules] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  // Which dialog is open, and for which rule
  const [pausing, setPausing] = useState(null);
  const [skipping, setSkipping] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  // totals, next 30 days and price changes cover every rule, not one page
  const [insights, setInsights] = useState(null);
  const [insightsKey, setInsightsKey] = useState(0);
  const refreshInsights = () => setInsightsKey((k) => k + 1);

  useEffect(() => {
    let alive = true;
    api("/recurring/insights").then(({ ok, data }) => {
      if (alive) setInsights(ok ? data : null);
    });
    return () => {
      alive = false;
    };
  }, [refreshKey, insightsKey]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api(`/recurring/transactions?page=${page}&limit=${PAGE_SIZE}`).then(
      ({ ok, data, error }) => {
        if (!alive) return;
        if (!ok) toast.error(error);
        setRules(ok ? data.data : []);
        setPagination(ok ? data.pagination : {});
        setLoading(false);
      }
    );
    return () => {
      alive = false;
    };
  }, [page, refreshKey]);

  const replaceRule = (updated) =>
    setRules((list) =>
      list.map((r) => (r._id === updated._id ? { ...r, ...updated } : r))
    );

  // pause / resume / skip share the same shape
  const act = async (rule, action) => {
    setBusyId(rule._id);
    const { ok, data, error } = await api(
      `/recurring/${action}Transaction/${rule._id}`,
      { method: "POST" }
    );
    setBusyId(null);
    setPausing(null);
    setSkipping(null);
    if (!ok) return toast.error(error);
    replaceRule(data.data);
    refreshInsights();
    const short = (d) => formatDay(d, { year: undefined });
    toast.success(
      action === "pause"
        ? "Paused. No new transactions until you resume."
        : action === "resume"
          ? "Resumed"
          : data.data.nextOccurrence
            ? `Skipped ${short(data.skipped)}. Next payment: ${short(data.data.nextOccurrence)}.`
            : `Skipped ${short(data.skipped)}. That was the last one.`
    );
  };

  const remove = async () => {
    setBusyId(deleting._id);
    const { ok, data, error } = await api(
      `/recurring/transaction/${deleting._id}`,
      { method: "DELETE" }
    );
    setBusyId(null);
    if (!ok) return toast.error(error);
    setDeleting(null);
    toast.success(data.message);
    setRefreshKey((k) => k + 1); // counts and paging change
  };

  const sync = async () => {
    setSyncing(true);
    const { ok, data, error } = await api("/sync", { method: "POST" });
    setSyncing(false);
    if (!ok) return toast.error(error);
    toast.success(data.message);
    setRefreshKey((k) => k + 1);
  };

  const committed = insights?.committed;
  const today = todayString();
  const upcomingSkips = (r) =>
    (r.skipDates || []).map(dayOf).filter((d) => d >= today);

  return (
    <div>
      <PageHeader
        title="Recurring"
        subtitle="Payments and income that repeat automatically."
        actions={
          <button
            className="btn btn-sm btn-ghost border-base-300"
            onClick={sync}
            disabled={syncing}
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />{" "}
            {syncing ? "Syncing…" : "Sync now"}
          </button>
        }
      />

      {committed?.total > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <p className="label-muted">Active</p>
            <p className="num mt-1 text-xl font-semibold">
              {committed.active}
              <span className="text-sm font-normal text-base-content/50">
                {" "}
                / {committed.total}
              </span>
            </p>
          </Card>
          <Card className="p-4">
            <p className="label-muted">Going out / month</p>
            <p className="num mt-1 text-xl font-semibold">
              ≈ {money(committed.expense)}
            </p>
          </Card>
          <Card className="col-span-2 p-4 sm:col-span-1">
            <p className="label-muted">Coming in / month</p>
            <p className="num mt-1 text-xl font-semibold text-success">
              ≈ {money(committed.income)}
            </p>
          </Card>
        </div>
      )}

      <PriceChanges changes={insights?.priceChanges} />
      {committed?.active > 0 && <Upcoming upcoming={insights.upcoming} />}

      <Card>
        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : rules.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="Nothing recurring yet"
            text='When you add a transaction, switch on "Repeat automatically" and it will show up here.'
            action={
              <Link to="/add" className="btn btn-primary btn-sm">
                <Plus size={16} /> Add transaction
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-base-300">
            {rules.map((r) => {
              const skips = upcomingSkips(r);
              const name = r.note || "recurring payment";
              return (
                <li
                  key={r._id}
                  className={`flex items-center gap-3 px-4 py-4 sm:px-5 ${r.isActive ? "" : "opacity-60"}`}
                >
                  <CategoryIcon txn={r} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {r.note || "Recurring transaction"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-base-content/55">
                      {frequencyLabel(r.frequency)}
                      <span className="hidden sm:inline">
                        {" "}
                        · since {formatDay(r.startDate)}
                      </span>
                      {r.endDate && ` · until ${formatDay(r.endDate)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`num font-semibold ${r.type === "income" ? "text-success" : ""}`}
                    >
                      {r.type === "income" ? "+" : "−"}
                      {money(r.amount, { exact: true })}
                    </p>
                    <p className="text-xs text-base-content/55">
                      {r.isActive && r.nextOccurrence
                        ? `Next: ${formatDay(r.nextOccurrence, { year: undefined })}`
                        : r.endDate && !r.isActive
                          ? "Ended"
                          : "Paused"}
                    </p>
                    {skips.length > 0 && (
                      <p className="text-[11px] text-warning">
                        Skipping{" "}
                        {skips
                          .map((d) => formatDay(d, { year: undefined }))
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <span
                    className={`badge badge-sm hidden sm:inline-flex ${r.isActive ? "badge-success badge-soft" : "badge-ghost"}`}
                  >
                    {r.isActive ? "Active" : "Paused"}
                  </span>
                  <button
                    className="btn btn-sm btn-ghost border-base-300 max-sm:btn-square"
                    disabled={busyId === r._id}
                    onClick={() =>
                      r.isActive ? setPausing(r) : act(r, "resume")
                    }
                    aria-label={`${r.isActive ? "Pause" : "Resume"} ${name}`}
                  >
                    {busyId === r._id ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : r.isActive ? (
                      <Pause size={15} />
                    ) : (
                      <Play size={15} />
                    )}
                    <span className="hidden sm:inline">
                      {r.isActive ? "Pause" : "Resume"}
                    </span>
                  </button>
                  <div className="dropdown dropdown-end">
                    <button
                      tabIndex={0}
                      className="btn btn-sm btn-ghost btn-square"
                      aria-label={`More actions for ${name}`}
                    >
                      <Ellipsis size={17} />
                    </button>
                    <ul
                      tabIndex={0}
                      className="menu dropdown-content z-20 mt-1 w-48 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
                    >
                      <li>
                        <button
                          onClick={() => {
                            closeMenu();
                            setEditing(r);
                          }}
                        >
                          <Pencil size={15} /> Edit
                        </button>
                      </li>
                      {r.isActive && r.nextOccurrence && (
                        <li>
                          <button
                            onClick={() => {
                              closeMenu();
                              setSkipping(r);
                            }}
                          >
                            <SkipForward size={15} /> Skip next payment
                          </button>
                        </li>
                      )}
                      <li>
                        <button
                          className="text-error"
                          onClick={() => {
                            closeMenu();
                            setDeleting(r);
                          }}
                        >
                          <Trash2 size={15} /> Delete series
                        </button>
                      </li>
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-base-300 px-5 py-3 text-sm">
            <button
              className="btn btn-sm btn-ghost"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-base-content/60">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-sm btn-ghost"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </Card>

      {editing && (
        <EditRuleModal
          rule={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            replaceRule(updated);
            refreshInsights();
            setEditing(null);
          }}
        />
      )}

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
      <ConfirmDialog
        open={!!skipping}
        title="Skip the next payment?"
        message={
          skipping
            ? `No transaction will be added on ${formatDay(skipping.nextOccurrence)}. The series continues after that.`
            : ""
        }
        confirmLabel="Skip it"
        tone="primary"
        loading={busyId === skipping?._id}
        onConfirm={() => act(skipping, "skip")}
        onCancel={() => setSkipping(null)}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Delete this recurring series?"
        message="No more payments will be added. Transactions it already added stay in your history."
        confirmLabel="Delete series"
        loading={busyId === deleting?._id}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
