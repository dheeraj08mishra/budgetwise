import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Pencil, Trash2, Repeat, Paperclip } from "lucide-react";
import {
  removeTransaction,
  updateTransaction,
} from "../utils/redux/transactionSlice";
import { api } from "../utils/api";
import { money } from "../utils/format";
import {
  categoryMeta,
  isIncome,
  EXPENSE_CATEGORIES,
  CATEGORIES,
} from "../utils/categories";
import {
  dayKey,
  formatDay,
  todayString,
  firstOfMonthString,
} from "../utils/dates";
import { ConfirmDialog, Modal, Field, Segmented } from "./ui";
import TagEditor from "./TagEditor";
import ReceiptField from "./ReceiptField";
import { sortTransactions } from "../utils/transactions";

export { sortTransactions };

export const CategoryIcon = ({ txn, size = "size-10" }) => {
  const meta = categoryMeta(txn);
  const Icon = meta.icon;
  return (
    <span
      className={`${size} grid shrink-0 place-items-center rounded-xl`}
      style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
    >
      <Icon size={18} aria-hidden />
    </span>
  );
};

export const TransactionRow = ({
  txn,
  onEdit,
  onDelete,
  onTagClick,
  showDate = false,
}) => {
  const income = isIncome(txn);
  const meta = categoryMeta(txn);
  return (
    <div className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-base-200/60">
      <CategoryIcon txn={txn} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate font-medium">
          <span className="truncate">{txn.note || meta.label}</span>
          {txn.isRecurring && (
            <Repeat
              size={13}
              className="shrink-0 text-base-content/40"
              aria-label="Recurring"
            />
          )}
          {txn.receipt && (
            <Paperclip
              size={13}
              className="shrink-0 text-base-content/40"
              aria-label="Has a receipt"
            />
          )}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-base-content/55">
          <span>{meta.label}</span>
          {showDate && <span>· {formatDay(txn.date)}</span>}
          {txn.tags?.slice(0, 3).map((tag) =>
            onTagClick ? (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick(tag)}
                className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] text-base-content/60 hover:bg-primary/10 hover:text-primary"
                aria-label={`Show transactions tagged ${tag}`}
              >
                {tag}
              </button>
            ) : (
              <span
                key={tag}
                className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] text-base-content/60"
              >
                {tag}
              </span>
            )
          )}
        </p>
      </div>
      <p
        className={`num shrink-0 text-right font-semibold ${income ? "text-success" : ""}`}
      >
        {income ? "+" : "−"}
        {money(txn.amount, { exact: true })}
      </p>
      {(onEdit || onDelete) && (
        <div className="flex shrink-0 gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          {onEdit && (
            <button
              className="btn btn-ghost btn-xs btn-square"
              onClick={() => onEdit(txn)}
              aria-label={`Edit ${txn.note || "transaction"}`}
            >
              <Pencil size={15} />
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-ghost btn-xs btn-square text-error"
              onClick={() => onDelete(txn)}
              aria-label={`Delete ${txn.note || "transaction"}`}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const sameTags = (a = [], b = []) =>
  a.length === b.length && a.every((t, i) => t === b[i]);

function EditModal({ txn, onClose, onChanged }) {
  const dispatch = useDispatch();
  const isGoal = txn.category === "goal";
  // Money fields are editable this month only; tags can always change
  const pastMonth = dayKey(txn.date) < firstOfMonthString();
  const original = {
    type: txn.type === "credit" ? "income" : txn.type,
    amount: String(txn.amount),
    category: txn.category,
    date: dayKey(txn.date),
    note: txn.note || "",
  };
  const [form, setForm] = useState(original);
  const [tags, setTags] = useState(txn.tags || []);
  const [receipt, setReceipt] = useState(txn.receipt || null);
  const [suggestions, setSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    api("/allTags").then(({ ok, data }) => ok && setSuggestions(data.data));
  }, []);

  const save = async () => {
    const fieldsChanged =
      !pastMonth && Object.keys(original).some((k) => form[k] !== original[k]);
    const tagsChanged = !sameTags(tags, txn.tags || []);
    if (!fieldsChanged && !tagsChanged) return onClose();

    let latest = txn;
    setSaving(true);
    if (fieldsChanged) {
      const amount = parseFloat(form.amount);
      const problem = !(amount > 0)
        ? "Amount must be a positive number."
        : form.date > todayString()
          ? "Date can't be in the future."
          : form.date < firstOfMonthString()
            ? "Only this month's transactions can be edited."
            : null;
      if (problem) {
        setSaving(false);
        return toast.error(problem);
      }
      const r = await api(`/user/update/transaction/${txn._id}`, {
        method: "PATCH",
        body: { ...form, amount: Math.round(amount * 100) / 100 },
      });
      if (!r.ok) {
        setSaving(false);
        return toast.error(r.error);
      }
      latest = r.data.data;
    }
    if (tagsChanged) {
      const r = await api(`/user/transaction/${txn._id}/tags`, {
        method: "PATCH",
        body: { tags },
      });
      if (!r.ok) {
        setSaving(false);
        return toast.error(r.error);
      }
      latest = r.data.data;
    }
    setSaving(false);
    dispatch(updateTransaction(latest));
    onChanged?.(txn, latest);
    toast.success("Transaction updated");
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit transaction"
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
        {pastMonth && (
          <p className="rounded-field bg-base-200 px-3 py-2 text-xs text-base-content/70">
            This is from a past month, so only its tags and receipt can be
            changed.
          </p>
        )}
        <fieldset disabled={pastMonth} className="flex flex-col gap-4">
          {!isGoal && (
            <Segmented
              label="Type"
              options={[
                { value: "expense", label: "Expense" },
                { value: "income", label: "Income" },
              ]}
              value={form.type}
              onChange={set("type")}
            />
          )}
          <Field label="Amount" htmlFor="edit-amount">
            <label className="input w-full">
              <span className="text-base-content/50">₹</span>
              <input
                id="edit-amount"
                type="text"
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
          {!isGoal && form.type === "expense" && (
            <Field label="Category" htmlFor="edit-category">
              <select
                id="edit-category"
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
          <Field
            label="Date"
            hint={
              pastMonth
                ? undefined
                : "Transactions from this month can be edited"
            }
            htmlFor="edit-date"
          >
            <input
              id="edit-date"
              type="date"
              className="input w-full"
              value={form.date}
              min={pastMonth ? undefined : firstOfMonthString()}
              max={todayString()}
              onChange={(e) => set("date")(e.target.value)}
            />
          </Field>
          <Field label="Note" htmlFor="edit-note">
            <input
              id="edit-note"
              className="input w-full"
              maxLength={200}
              value={form.note}
              onChange={(e) => set("note")(e.target.value)}
            />
          </Field>
        </fieldset>
        <Field label="Tags" htmlFor="edit-tags">
          <TagEditor
            id="edit-tags"
            tags={tags}
            onChange={setTags}
            suggestions={suggestions}
          />
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-medium">Receipt</p>
          <ReceiptField
            txn={{ ...txn, receipt }}
            onChange={(r) => {
              setReceipt(r);
              // saved already: update the list without waiting for Save
              const next = { ...txn, receipt: r };
              dispatch(updateTransaction(next));
              onChanged?.(txn, next);
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

// Groups consecutive same-day rows and handles edit + confirmed delete.
// onChanged(before, after) fires after an edit (after = updated row) or a
// delete (after = null), so a parent can keep its own totals in sync.
export default function TransactionList({
  transactions,
  groupByDay = true,
  limit,
  order = "newest",
  onChanged,
  onTagClick,
}) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const sorted = sortTransactions(transactions, order);
  const shown = limit ? sorted.slice(0, limit) : sorted;

  const confirmDelete = async () => {
    setBusy(true);
    const { ok, error } = await api(
      `/user/transaction/delete/${deleting._id}`,
      { method: "DELETE" }
    );
    setBusy(false);
    if (!ok) return toast.error(error);
    dispatch(removeTransaction(deleting));
    onChanged?.(deleting, null);
    toast.success("Transaction deleted");
    setDeleting(null);
  };

  const groups = [];
  for (const txn of shown) {
    const key = dayKey(txn.date);
    if (
      !groupByDay ||
      !groups.length ||
      groups[groups.length - 1].key !== key
    ) {
      groups.push({ key, items: [txn] });
    } else {
      groups[groups.length - 1].items.push(txn);
    }
  }

  return (
    <>
      <div className="divide-y divide-base-300">
        {groups.map((g) => {
          const net = g.items.reduce(
            (s, t) => s + (isIncome(t) ? t.amount : -t.amount),
            0
          );
          return (
            <div key={g.key + g.items[0]._id}>
              {groupByDay && (
                <div className="flex items-center justify-between bg-base-200/50 px-5 py-2 text-xs font-medium text-base-content/55">
                  <span>{formatDay(g.key, { weekday: "short" })}</span>
                  <span className="num">
                    {net >= 0 ? "+" : "−"}
                    {money(Math.abs(net))}
                  </span>
                </div>
              )}
              {g.items.map((txn) => (
                <TransactionRow
                  key={txn._id}
                  txn={txn}
                  onTagClick={onTagClick}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                  showDate={!groupByDay}
                />
              ))}
            </div>
          );
        })}
      </div>

      {editing && (
        <EditModal
          txn={editing}
          onClose={() => setEditing(null)}
          onChanged={onChanged}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        title="Delete transaction?"
        message={
          deleting?.isRecurring
            ? "This removes the transaction. If it started a recurring series, that series stops too."
            : deleting?.category === "goal"
              ? "This removes the contribution and lowers the goal's saved amount."
              : "This can't be undone."
        }
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
