import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { isSpending } from "../../utils/categories";
import { dayKey, todayString } from "../../utils/dates";
import { money, moneyShort } from "../../utils/format";

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-field border border-base-300 bg-base-100 px-3 py-2 text-sm shadow-lg">
      <p className="text-xs text-base-content/60">{d.label}</p>
      <p className="num font-semibold">{money(d.amount)}</p>
    </div>
  );
};

// Daily spending for one month, every day shown (zero days included)
export default function SpendingTrend({ transactions, year, month }) {
  const data = useMemo(() => {
    const totals = {};
    for (const t of transactions) {
      if (isSpending(t))
        totals[dayKey(t.date)] = (totals[dayKey(t.date)] || 0) + t.amount;
    }
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    const today = todayString();
    const rows = [];
    for (let d = 1; d <= days; d++) {
      const key = prefix + String(d).padStart(2, "0");
      if (key > today) break; // don't draw the future as zero spending
      rows.push({
        day: d,
        label: new Date(key).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        }),
        amount: totals[key] || 0,
      });
    }
    return rows;
  }, [transactions, year, month]);

  return (
    <div className="h-64 w-full text-base-content/45">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: -8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="currentColor"
            strokeOpacity={0.15}
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 12 }}
            tickFormatter={moneyShort}
            width={56}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "currentColor", strokeOpacity: 0.3 }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#spendFill)"
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
