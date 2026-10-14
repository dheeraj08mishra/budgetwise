import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORIES } from "../../utils/categories";
import { money, percent } from "../../utils/format";

// Where the money went: expenses by category (goal savings included)
export default function CategoryDonut({ transactions }) {
  const { rows, total } = useMemo(() => {
    const sums = {};
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      sums[t.category] = (sums[t.category] || 0) + t.amount;
    }
    const total = Object.values(sums).reduce((a, b) => a + b, 0);
    const rows = Object.entries(sums)
      .map(([key, value]) => ({ key, value, ...(CATEGORIES[key] || CATEGORIES.other) }))
      .sort((a, b) => b.value - a.value);
    return { rows, total };
  }, [transactions]);

  if (!total) return <p className="label-muted py-10 text-center">No spending this month yet.</p>;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative size-44 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="label" innerRadius="68%" outerRadius="100%" paddingAngle={2} stroke="none">
              {rows.map((r) => <Cell key={r.key} fill={r.color} />)}
            </Pie>
            <Tooltip formatter={(v) => money(v)} contentStyle={{ borderRadius: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid grid-cols-1 place-items-center text-center">
          <div>
            <p className="text-xs text-base-content/55">Total out</p>
            <p className="num font-semibold">{money(total)}</p>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-3 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
            <span className="flex-1">{r.label}</span>
            <span className="num text-base-content/55">{percent((r.value / total) * 100)}</span>
            <span className="num w-24 text-right font-medium">{money(r.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
