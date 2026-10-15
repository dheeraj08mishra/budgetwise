import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { api } from "../utils/api";
import { money } from "../utils/format";
import { formatDay } from "../utils/dates";
import { Card, CardHeader, Skeleton } from "./ui";

// "At this pace you'll have ₹X left on the 31st" (current month only)
export default function ForecastCard({ refreshKey }) {
  const [f, setF] = useState(null);

  useEffect(() => {
    let alive = true;
    api("/insights/forecast").then(({ ok, data }) => alive && ok && setF(data));
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  if (!f) {
    return (
      <Card className="p-5">
        <Skeleton className="h-32" />
      </Card>
    );
  }

  const short = f.projectedLeft < 0;
  const monthEnd = formatDay(
    `${f.year}-${String(f.month).padStart(2, "0")}-${f.daysInMonth}`,
    { year: undefined }
  );
  const lines = [
    ["Income so far", f.income],
    ...(f.upcomingIncome ? [["Income still due", f.upcomingIncome]] : []),
    ["Spent so far", -f.spent],
    [
      `Everyday spending, ${money(f.dailyPace)}/day × ${f.daysLeft} days`,
      -f.projectedVariable,
    ],
    ...(f.upcomingExpenses
      ? [["Recurring payments still due", -f.upcomingExpenses]]
      : []),
    ...(f.saved ? [["Saved to goals", -f.saved]] : []),
  ];

  return (
    <Card>
      <CardHeader
        title="Month-end forecast"
        subtitle={
          f.roughEstimate
            ? "Rough: only a few days of data so far"
            : `By ${monthEnd}, at your current pace`
        }
      />
      <div className="px-5 pt-4 pb-5">
        <p
          className={`flex items-center gap-2 num text-2xl font-semibold ${short ? "text-error" : "text-success"}`}
        >
          {short ? (
            <TrendingDown size={20} aria-hidden />
          ) : (
            <TrendingUp size={20} aria-hidden />
          )}
          {short ? `−${money(-f.projectedLeft)}` : money(f.projectedLeft)}
        </p>
        <p className="label-muted mt-1">
          {short
            ? "At this pace you'd spend more than you earn this month."
            : `Expected to be left on ${monthEnd}.`}
        </p>
        <ul className="mt-4 space-y-1.5 text-sm">
          {lines.map(([label, value]) => (
            <li key={label} className="flex justify-between gap-3">
              <span className="min-w-0 text-base-content/60">{label}</span>
              <span className="num shrink-0 whitespace-nowrap">
                {value < 0 ? "−" : "+"}
                {money(Math.abs(value))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
