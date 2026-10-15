import { useState } from "react";
import toast from "react-hot-toast";
import { TriangleAlert, Sparkles } from "lucide-react";
import { api } from "../utils/api";
import { money } from "../utils/format";
import { CATEGORIES } from "../utils/categories";
import { Modal, Field } from "./ui";

const BAR = {
  ok: "progress-success",
  warning: "progress-warning",
  over: "progress-error",
};

// One bar per category that has a budget
export function BudgetBars({ rows }) {
  const withLimit = rows.filter((r) => r.limit);
  return (
    <ul className="space-y-5 px-5 pb-5">
      {withLimit.map((r) => (
        <li key={r.category}>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="font-medium">{CATEGORIES[r.category].label}</span>
            <span className="num">
              <span
                className={`font-semibold ${r.level === "over" ? "text-error" : r.level === "warning" ? "text-warning" : ""}`}
              >
                {r.percent}%
              </span>
            </span>
          </div>
          <progress
            className={`progress h-2 w-full ${BAR[r.level] || "progress-success"}`}
            value={Math.min(r.percent, 100)}
            max="100"
            aria-label={`${CATEGORIES[r.category].label}: ${r.percent}% of budget`}
          />
          <p className="num mt-1 text-xs text-base-content/50">
            {money(r.spent)} of {money(r.limit)}
            {r.level === "over"
              ? ` · ${money(r.spent - r.limit)} over`
              : ` · ${money(r.limit - r.spent)} left`}
          </p>
        </li>
      ))}
    </ul>
  );
}

// "Wants: 92% of ₹8,000 used" for categories at 80%+
export function BudgetAlerts({ rows }) {
  const alerts = rows.filter(
    (r) => r.level === "warning" || r.level === "over"
  );
  if (!alerts.length) return null;
  const over = alerts.some((r) => r.level === "over");
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-box border px-4 py-3 text-sm ${over ? "border-error/30 bg-error/10" : "border-warning/40 bg-warning/10"}`}
    >
      <TriangleAlert
        size={18}
        className={`mt-0.5 shrink-0 ${over ? "text-error" : "text-warning"}`}
      />
      <div>
        <p className="font-medium">
          {over ? "Over budget this month" : "Close to your budget this month"}
        </p>
        <p className="mt-0.5 text-base-content/70">
          {alerts
            .map(
              (r) =>
                `${CATEGORIES[r.category].label}: ${r.percent}% of ${money(r.limit)}${r.level === "over" ? " (over)" : ""}`
            )
            .join(" · ")}
        </p>
      </div>
    </div>
  );
}

const SUGGEST = { need: 0.5, want: 0.3, investment: 0.2 }; // 50/30/20

export function BudgetsModal({ open, onClose, rows, income, onSaved }) {
  const initial = Object.fromEntries(
    (rows || []).map((r) => [r.category, r.limit ? String(r.limit) : ""])
  );
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const suggest = () =>
    setForm((f) => ({
      ...f,
      ...Object.fromEntries(
        Object.entries(SUGGEST).map(([k, share]) => [
          k,
          String(Math.round((income * share) / 100) * 100),
        ])
      ),
    }));

  const save = async () => {
    setSaving(true);
    const body = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [
        k,
        v.trim() === "" ? null : v.trim(),
      ])
    );
    const r = await api("/budgets", { method: "PUT", body });
    setSaving(false);
    if (!r.ok) return toast.error(r.error);
    toast.success("Budgets saved");
    onSaved(r.data.data);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Monthly budgets"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving && <span className="loading loading-spinner loading-sm" />}
            Save budgets
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-base-content/65">
          Set a monthly limit per category. You’ll see a warning at 80% and when
          you go over. Leave a field empty for no budget.
        </p>
        {income > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-soft btn-primary self-start"
            onClick={suggest}
          >
            <Sparkles size={15} /> Suggest from income (50 / 30 / 20)
          </button>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(rows || []).map((r) => (
            <Field
              key={r.category}
              label={CATEGORIES[r.category].label}
              hint={`Spent this month: ${money(r.spent)}`}
              htmlFor={`budget-${r.category}`}
            >
              <label className="input w-full">
                <span className="text-base-content/50">₹</span>
                <input
                  id={`budget-${r.category}`}
                  inputMode="decimal"
                  className="num"
                  placeholder="No budget"
                  value={form[r.category] ?? ""}
                  onChange={(e) =>
                    /^\d*(\.\d{0,2})?$/.test(e.target.value) &&
                    setForm((f) => ({ ...f, [r.category]: e.target.value }))
                  }
                />
              </label>
            </Field>
          ))}
        </div>
      </div>
    </Modal>
  );
}
