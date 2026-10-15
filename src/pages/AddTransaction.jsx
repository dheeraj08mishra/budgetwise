import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Repeat } from "lucide-react";
import { api } from "../utils/api";
import { money } from "../utils/format";
import { CATEGORIES, EXPENSE_CATEGORIES } from "../utils/categories";
import { todayString, firstOfMonthString } from "../utils/dates";
import { Card, PageHeader, Segmented, Field } from "../components/ui";
import FrequencyPicker from "../components/FrequencyPicker";

const MAX = 1000000;

export default function AddTransaction() {
  const navigate = useNavigate();
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("need");
  const [date, setDate] = useState(todayString());
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [endDate, setEndDate] = useState(""); // optional
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    const n = parseFloat(amount);
    if (!(n > 0)) e.amount = "Enter an amount greater than zero.";
    else if (n > MAX) e.amount = "Amount can't exceed ₹10,00,000.";
    if (date > todayString()) e.date = "Date can't be in the future.";
    else if (date < firstOfMonthString())
      e.date = "Pick a date in the current month.";
    if (isRecurring && endDate && endDate < date)
      e.endDate = "The end date can't be before the first payment.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (saving || !validate()) return;
    setSaving(true);
    const { ok, data, error } = await api("/user/addTransaction", {
      method: "POST",
      body: {
        type,
        amount: Math.round(parseFloat(amount) * 100) / 100,
        category: type === "income" ? "other" : category,
        date,
        note: note.trim(),
        isRecurring,
        ...(isRecurring && { frequency, ...(endDate && { endDate }) }),
      },
    });
    setSaving(false);
    if (!ok) return toast.error(error);
    // Tagging calls OpenAI and can be slow: fire and forget
    if (note.trim()) api(`/extractTags/${data.data._id}`, { method: "POST" });
    toast.success(type === "income" ? "Income added" : "Expense added");
    // This expense took its category to 80%+ of the monthly budget
    const alert = data.budgetAlert;
    if (alert) {
      const label = CATEGORIES[alert.category].label;
      toast(
        alert.level === "over"
          ? `${label} is over budget: ${money(alert.spent)} of ${money(alert.limit)} (${alert.percent}%).`
          : `You've used ${alert.percent}% of your ${label} budget (${money(alert.limit)}).`,
        { icon: "⚠️", duration: 7000 }
      );
    }
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Add transaction"
        subtitle="Record money coming in or going out."
      />
      <Card className="p-5 sm:p-6">
        <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
          <Segmented
            label="Transaction type"
            options={[
              { value: "expense", label: "Expense" },
              { value: "income", label: "Income" },
            ]}
            value={type}
            onChange={setType}
          />

          <Field error={errors.amount}>
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <div
              className={`flex items-center gap-2 rounded-field border px-4 py-3 focus-within:border-primary ${errors.amount ? "border-error" : "border-base-300"}`}
            >
              <span className="text-2xl text-base-content/40">₹</span>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="0"
                className="num w-full bg-transparent text-3xl font-semibold outline-none"
                value={amount}
                onChange={(e) =>
                  /^\d*(\.\d{0,2})?$/.test(e.target.value) &&
                  setAmount(e.target.value)
                }
                aria-invalid={!!errors.amount}
              />
            </div>
          </Field>

          {type === "expense" && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Category</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {EXPENSE_CATEGORIES.map((key) => {
                  const c = CATEGORIES[key];
                  const active = category === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1.5 rounded-field border px-2 py-3 text-sm transition-colors ${
                        active
                          ? "border-primary bg-primary/5 font-medium"
                          : "border-base-300 hover:bg-base-200"
                      }`}
                    >
                      <c.icon
                        size={20}
                        style={{ color: c.color }}
                        aria-hidden
                      />
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-base-content/50">
                {CATEGORIES[category].hint}
              </p>
            </fieldset>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date" error={errors.date} htmlFor="date">
              <input
                id="date"
                type="date"
                className={`input w-full ${errors.date ? "input-error" : ""}`}
                value={date}
                min={firstOfMonthString()}
                max={todayString()}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field
              label="Note"
              hint="Used for search and auto-tags"
              htmlFor="note"
            >
              <input
                id="note"
                className="input w-full"
                placeholder={
                  type === "income" ? "e.g. Salary" : "e.g. Groceries"
                }
                maxLength={200}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
          </div>

          <div className="rounded-field border border-base-300 p-4">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                <span className="grid grid-cols-1 size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Repeat size={17} />
                </span>
                <span>
                  <span className="block text-sm font-medium">
                    Repeat automatically
                  </span>
                  <span className="block text-xs text-base-content/55">
                    Rent, salary, subscriptions…
                  </span>
                </span>
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
            </label>
            {isRecurring && (
              <div className="mt-4 flex flex-col gap-4">
                <FrequencyPicker value={frequency} onChange={setFrequency} />
                <Field
                  label="Ends on"
                  hint="Optional. Leave empty to repeat until you stop it."
                  error={errors.endDate}
                  htmlFor="end-date"
                >
                  <input
                    id="end-date"
                    type="date"
                    className={`input w-full sm:w-56 ${errors.endDate ? "input-error" : ""}`}
                    value={endDate}
                    min={date}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-ghost flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-[2]"
              disabled={saving}
            >
              {saving && (
                <span className="loading loading-spinner loading-sm" />
              )}
              Save {type}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
