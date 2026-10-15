import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { TrendingUp, TrendingDown, ChartLine, CircleCheck } from "lucide-react";
import { api } from "../utils/api";
import { money, percent } from "../utils/format";
import {
  Card,
  CardHeader,
  PageHeader,
  Segmented,
  EmptyState,
  Skeleton,
} from "../components/ui";
import InsightsChart from "../components/charts/InsightsChart";
import YearCompare from "../components/YearCompare";

const METHODS = [
  { value: "previous", label: "vs last month" },
  { value: "rollingAvg", label: "vs 3-month avg" },
  { value: "zScore", label: "vs year average" },
];
const METHOD_HELP = {
  previous:
    "Flags months whose spending moved 20% or more compared with the month before.",
  rollingAvg:
    "Flags months that differ 20% or more from the average of the previous three months.",
  zScore:
    "Flags months that are unusually far from your average for the year (z-score).",
};

export default function Insights() {
  const [years, setYears] = useState(null);
  const [year, setYear] = useState(null);
  const [method, setMethod] = useState("previous");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/user/transaction/dataMonthList").then(({ data }) => {
      const ys = [...new Set((data?.data || []).map((m) => m.year))].sort(
        (a, b) => b - a
      );
      setYears(ys);
      setYear(ys[0] ?? null);
      if (!ys.length) setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!year) return;
    let alive = true;
    setLoading(true);
    // Anomalies already include income/spending/savings per month
    api("/insights/anomalyDetection", {
      method: "POST",
      body: { year, method },
    }).then(({ ok, data, error }) => {
      if (!alive) return;
      if (!ok && error) toast.error(error);
      setRows(ok ? data.anomalies : []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [year, method]);

  const stats = useMemo(() => {
    if (!rows.length) return null;
    const income = rows.reduce((s, r) => s + r.income, 0);
    const spending = rows.reduce((s, r) => s + r.expense, 0);
    const savings = rows.reduce((s, r) => s + (r.savings || 0), 0);
    const top = rows.reduce((a, b) => (b.expense > a.expense ? b : a));
    return {
      income,
      spending,
      savings,
      avg: spending / rows.length,
      top,
      rate: income ? (savings / income) * 100 : 0,
    };
  }, [rows]);

  const alerts = rows.filter((r) => r.anomaly && r.anomaly !== "normal");
  const usedMethod = rows[0]?.method;

  if (years !== null && years.length === 0) {
    return (
      <div>
        <PageHeader title="Insights" />
        <Card>
          <EmptyState
            icon={ChartLine}
            title="No data yet"
            text="Insights appear once you've recorded a month or two of transactions."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        subtitle="How your income, spending and savings change month to month."
        actions={
          <select
            className="select select-sm w-28"
            value={year ?? ""}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Year"
          >
            {(years || []).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Income", stats && money(stats.income)],
          ["Spending", stats && money(stats.spending)],
          ["Avg spending / month", stats && money(stats.avg)],
          ["Savings rate", stats && percent(stats.rate)],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="label-muted">{label}</p>
            {loading ? (
              <Skeleton className="mt-2 h-7 w-24" />
            ) : (
              <p className="num mt-1 text-xl font-semibold">{value ?? "—"}</p>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title={`Month by month, ${year ?? ""}`}
          subtitle={METHOD_HELP[method]}
          action={
            <div className="hidden md:block">
              <Segmented
                label="Detection method"
                options={METHODS}
                value={method}
                onChange={setMethod}
                size="sm"
              />
            </div>
          }
        />
        <div className="px-5 pt-3 md:hidden">
          <Segmented
            label="Detection method"
            options={METHODS}
            value={method}
            onChange={setMethod}
            size="sm"
          />
        </div>
        <div className="px-3 pb-4 pt-4">
          {loading ? (
            <Skeleton className="mx-2 h-80" />
          ) : (
            <InsightsChart data={rows} />
          )}
        </div>
        {usedMethod && usedMethod !== method && !loading && (
          <p className="px-5 pb-4 text-xs text-base-content/55">
            Only {rows.length} month(s) of data, so months are compared with the
            previous month.
          </p>
        )}
      </Card>

      {year && <YearCompare year={year} years={years} />}

      <Card>
        <CardHeader title="Spending alerts" subtitle="Months that stand out" />
        {loading ? (
          <div className="p-5">
            <Skeleton className="h-16" />
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState
            icon={CircleCheck}
            title="Nothing unusual"
            text={`Your spending in ${year} was steady by this measure.`}
          />
        ) : (
          <ul className="divide-y divide-base-300 pt-2">
            {alerts.map((a) => {
              const spike = a.anomaly === "spike";
              const Icon = spike ? TrendingUp : TrendingDown;
              const base =
                a.method === "rollingAvg"
                  ? "the 3-month average"
                  : a.method === "zScore"
                    ? "your average"
                    : "the month before";
              return (
                <li
                  key={a.monthNumber}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <span
                    className={`grid size-10 place-items-center rounded-xl ${spike ? "bg-error/10 text-error" : "bg-info/10 text-info"}`}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">
                      {a.month}: spending {spike ? "spiked" : "dropped"}
                    </p>
                    <p className="text-sm text-base-content/60">
                      {money(a.expense)} spent
                      {a.percentChange !== undefined &&
                        `, ${Math.round(Math.abs(a.percentChange))}% ${spike ? "above" : "below"} ${base}`}
                      {a.zScore !== undefined && ` (z-score ${a.zScore})`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {stats && !loading && (
          <p className="border-t border-base-300 px-5 py-3 text-sm text-base-content/60">
            Highest spending:{" "}
            <span className="font-medium text-base-content">
              {stats.top.month}
            </span>{" "}
            ({money(stats.top.expense)}).
          </p>
        )}
      </Card>
    </div>
  );
}
