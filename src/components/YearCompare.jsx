import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarRange } from "lucide-react";
import { api } from "../utils/api";
import { money, change, periodLabel } from "../utils/format";
import { CATEGORIES } from "../utils/categories";
import { Card, CardHeader, Delta, EmptyState, Segmented, Skeleton } from "./ui";
import YearCompareChart from "./charts/YearCompareChart";

const METRICS = [
  { value: "expense", label: "Spending", goodWhenUp: false },
  { value: "income", label: "Income", goodWhenUp: true },
  { value: "savings", label: "Saved to goals", goodWhenUp: true },
];

// Change vs the other year; "New in 2026" when the other year had nothing
function CompareDelta({ current, previous, year, against, goodWhenUp }) {
  if (!previous) {
    return current ? (
      <span className="text-xs text-base-content/55">New in {year}</span>
    ) : null;
  }
  if (current === previous) {
    return (
      <span className="text-xs text-base-content/55">Same as {against}</span>
    );
  }
  return (
    <Delta
      value={change(current, previous)}
      goodWhenUp={goodWhenUp}
      suffix={`vs ${against}`}
    />
  );
}

// Insights: this year against another, over the months both have data
export default function YearCompare({ year, years }) {
  const others = (years || []).filter((y) => y !== year);
  const [against, setAgainst] = useState(null);
  const [metric, setMetric] = useState("expense");
  const [data, setData] = useState(null);

  // Default to the year before, else the closest year there is
  useEffect(() => {
    if (!year) return;
    setAgainst(others.includes(year - 1) ? year - 1 : (others[0] ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, years]);

  useEffect(() => {
    if (!year || !against) return;
    let alive = true;
    setData(null);
    api(`/insights/compare?year=${year}&against=${against}`).then(
      ({ ok, data, error }) => {
        if (!alive) return;
        if (!ok) toast.error(error || "Couldn't load the comparison");
        setData(ok ? data : null);
      }
    );
    return () => {
      alive = false;
    };
  }, [year, against]);

  if (!others.length) {
    return (
      <Card>
        <CardHeader title="Compare years" />
        <EmptyState
          icon={CalendarRange}
          title="Nothing to compare yet"
          text="Once you have transactions in two different years, you can compare them here."
        />
      </Card>
    );
  }

  const ready = data && data.year === year && data.against === against;
  const period = ready ? data.period : [];
  const label = periodLabel(period);

  return (
    <Card>
      <CardHeader
        title={`${year} vs ${against ?? ""}`}
        subtitle={
          !ready
            ? "Comparing…"
            : period.length
              ? `Totals cover ${label}: finished months that both years have data for.`
              : "These years have no finished months in common yet, so only the chart is shown."
        }
        action={
          <select
            className="select select-sm w-28"
            value={against ?? ""}
            onChange={(e) => setAgainst(Number(e.target.value))}
            aria-label="Compare with year"
          >
            {others.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid gap-3 px-5 pt-4 sm:grid-cols-3">
        {METRICS.map((m) => {
          const cur = ready ? data.totals.current[m.value] : 0;
          const prev = ready ? data.totals.previous[m.value] : 0;
          return (
            <div key={m.value} className="rounded-box bg-base-200/60 p-4">
              <p className="label-muted">{m.label}</p>
              {!ready ? (
                <Skeleton className="mt-2 h-7 w-24" />
              ) : (
                <>
                  <p className="num mt-1 text-xl font-semibold">
                    {period.length ? money(cur) : "—"}
                  </p>
                  <p className="mt-1 text-xs text-base-content/55">
                    {period.length ? `${money(prev)} in ${against}` : ""}
                  </p>
                  <div className="mt-1 min-h-5">
                    {period.length > 0 && (
                      <CompareDelta
                        current={cur}
                        previous={prev}
                        year={year}
                        against={against}
                        goodWhenUp={m.goodWhenUp}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 pt-5">
        <Segmented
          label="Compare"
          options={METRICS}
          value={metric}
          onChange={setMetric}
          size="sm"
        />
      </div>
      <div className="px-3 pb-2 pt-3">
        {ready ? (
          <YearCompareChart
            months={data.months}
            metric={metric}
            year={year}
            against={against}
          />
        ) : (
          <Skeleton className="mx-2 h-72" />
        )}
      </div>

      {ready && period.length > 0 && (
        <div className="border-t border-base-300 px-5 py-4">
          <p className="mb-3 text-sm font-medium">
            Spending by category, {label}
          </p>
          <ul className="space-y-3">
            {data.categories.map((c) => {
              const meta = CATEGORIES[c.category];
              const max = Math.max(c.current, c.previous, 1);
              return (
                <li key={c.category}>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 text-sm">
                    <span className="font-medium">{meta.label}</span>
                    <span className="flex items-center gap-3">
                      <span className="num">
                        {money(c.current)}{" "}
                        <span className="text-base-content/50">
                          vs {money(c.previous)}
                        </span>
                      </span>
                      <CompareDelta
                        current={c.current}
                        previous={c.previous}
                        year={year}
                        against={against}
                        goodWhenUp={c.category === "investment"}
                      />
                    </span>
                  </div>
                  <div className="mt-1.5 space-y-1" aria-hidden>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${(c.current / max) * 100}%`,
                        background: meta.color,
                      }}
                    />
                    <div
                      className="h-1.5 rounded-full bg-base-content/20"
                      style={{ width: `${(c.previous / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
