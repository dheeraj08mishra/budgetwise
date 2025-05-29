import React from "react";
import { useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useSelector } from "react-redux";

const COLORS = {
  need: "#34D399",
  want: "#FBBF24",
  investment: "#60A5FA",
  other: "#F472B6",
  remaining: "#A78BFA",
};

const PieChartCategory = () => {
  const transactions = useSelector((store) => store.transaction.transactions);
  const salary = useSelector((store) => store.budget.salary);

  const groupedData = transactions.reduce((acc, transaction) => {
    if (!transaction) return acc;
    if (transaction.type === "income") return acc;
    const { category, amount, type } = transaction;
    if (!acc[category]) {
      acc[category] = { name: category, value: 0, type: type };
    }
    acc[category].value += amount;
    return acc;
  }, {});

  if (salary === 0) {
    groupedData.remaining = {
      name: "remaining",
      value: 0,
      type: "remaining",
    };
  } else {
    groupedData.remaining = {
      name: "remaining",
      value:
        salary -
        Object.values(groupedData).reduce((sum, item) => sum + item.value, 0),
      type: "remaining",
    };
  }
  const data = Object.values(groupedData).map((item) => ({
    name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    value: item.value,
    type: item.type,
    color: COLORS[item.name] || "#ccc",
  }));

  if (data.length === 0)
    return <p className="text-gray-400">No transactions to display.</p>;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("en", {
                style: "currency",
                currency: "INR",
              }).format(value)
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartCategory;
