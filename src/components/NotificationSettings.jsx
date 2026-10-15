import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateProfile } from "../utils/redux/profileSlice";
import { api } from "../utils/api";
import { Card, CardHeader } from "./ui";

const OPTIONS = [
  {
    key: "budgetAlerts",
    label: "Budget alerts",
    hint: "When a category reaches 80% of its budget, and if it goes over",
  },
  {
    key: "monthlySummary",
    label: "Monthly summary",
    hint: "On the 1st: last month's income, spending, savings and budgets",
  },
  {
    key: "recurringReminders",
    label: "Payment reminders",
    hint: "The day before a recurring payment is added",
  },
];

// Email preferences; each switch saves straight away
export default function NotificationSettings() {
  const dispatch = useDispatch();
  const current =
    useSelector((s) => s.profile.currentUser?.notifications) || {};
  const [busy, setBusy] = useState(null);

  const toggle = async (key, value) => {
    setBusy(key);
    const r = await api("/user/notifications", {
      method: "PATCH",
      body: { [key]: value },
    });
    setBusy(null);
    if (!r.ok) return toast.error(r.error);
    dispatch(updateProfile({ notifications: r.data.notifications }));
    toast.success(value ? "Turned on" : "Turned off", { id: "notif" });
  };

  return (
    <Card>
      <CardHeader title="Email notifications" />
      <ul className="divide-y divide-base-300 pt-2">
        {OPTIONS.map((o) => {
          const on = current[o.key] !== false;
          return (
            <li key={o.key} className="px-5 py-3">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">{o.label}</span>
                  <span className="block text-xs text-base-content/55">
                    {o.hint}
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm shrink-0"
                  checked={on}
                  disabled={busy === o.key}
                  onChange={(e) => toggle(o.key, e.target.checked)}
                  aria-label={o.label}
                />
              </label>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
