import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { money, moneyShort } from "../../utils/format";

const COLORS = { current: "#6366f1", previous: "#94a3b8" };

const ChartTooltip = ({ active, payload, year, against }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="min-w-44 rounded-field border border-base-300 bg-base-100 px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium">{d.month}</p>
      {[
        [year, d.current],
        [against, d.previous],
      ].map(([y, v]) => (
        <p key={y} className="flex justify-between gap-4">
          <span className="text-base-content/60">{y}</span>
          <span className="num">{money(v)}</span>
        </p>
      ))}
    </div>
  );
};

// One metric, month by month: this year's bar next to the other year's
export default function YearCompareChart({ months, metric, year, against }) {
  const rows = months.map((m) => ({
    month: m.month,
    short: m.month.slice(0, 3),
    current: m.current[metric],
    previous: m.previous[metric],
  }));
  return (
    <div className="h-72 w-full text-base-content/45">
      <ResponsiveContainer>
        <BarChart
          data={rows}
          margin={{ top: 10, right: 8, left: -4, bottom: 0 }}
          barGap={2}
        >
          <CartesianGrid
            vertical={false}
            stroke="currentColor"
            strokeOpacity={0.15}
          />
          <XAxis
            dataKey="short"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
            tickFormatter={moneyShort}
            width={60}
          />
          <Tooltip
            content={<ChartTooltip year={year} against={against} />}
            cursor={{ fill: "currentColor", fillOpacity: 0.06 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar
            dataKey="current"
            name={String(year)}
            fill={COLORS.current}
            radius={[6, 6, 0, 0]}
            maxBarSize={22}
          />
          <Bar
            dataKey="previous"
            name={String(against)}
            fill={COLORS.previous}
            radius={[6, 6, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
