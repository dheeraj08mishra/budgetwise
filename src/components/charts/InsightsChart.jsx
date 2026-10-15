import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import { money, moneyShort } from "../../utils/format";

const COLORS = {
  income: "#10b981",
  spending: "#6366f1",
  savings: "#8b5cf6",
  spike: "#f43f5e",
  drop: "#0ea5e9",
};

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="min-w-44 rounded-field border border-base-300 bg-base-100 px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium">
        {d.month} {d.year}
      </p>
      <p className="flex justify-between gap-4">
        <span className="text-base-content/60">Income</span>
        <span className="num">{money(d.income)}</span>
      </p>
      <p className="flex justify-between gap-4">
        <span className="text-base-content/60">Spending</span>
        <span className="num">{money(d.expense)}</span>
      </p>
      <p className="flex justify-between gap-4">
        <span className="text-base-content/60">Saved</span>
        <span className="num">{money(d.savings || 0)}</span>
      </p>
      {d.anomaly && d.anomaly !== "normal" && (
        <p className="mt-1 font-medium" style={{ color: COLORS[d.anomaly] }}>
          Spending {d.anomaly === "spike" ? "spike" : "drop"}
          {d.percentChange !== undefined &&
            ` (${d.percentChange > 0 ? "+" : ""}${d.percentChange}%)`}
        </p>
      )}
    </div>
  );
};

// Monthly income (bars), spending (bars, red/blue when anomalous), savings (line)
export default function InsightsChart({ data }) {
  const rows = data.map((d) => ({ ...d, short: d.month.slice(0, 3) }));
  return (
    <div className="h-80 w-full text-base-content/45">
      <ResponsiveContainer>
        <ComposedChart
          data={rows}
          margin={{ top: 10, right: 8, left: -4, bottom: 0 }}
          barGap={4}
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
            content={<ChartTooltip />}
            cursor={{ fill: "currentColor", fillOpacity: 0.06 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill={COLORS.income}
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="expense"
            name="Spending"
            fill={COLORS.spending}
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          >
            {rows.map((r) => (
              <Cell
                key={`${r.year}-${r.monthNumber}`}
                fill={
                  r.anomaly === "spike"
                    ? COLORS.spike
                    : r.anomaly === "drop"
                      ? COLORS.drop
                      : COLORS.spending
                }
              />
            ))}
          </Bar>
          <Line
            dataKey="savings"
            name="Saved"
            stroke={COLORS.savings}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export { COLORS as INSIGHT_COLORS };
