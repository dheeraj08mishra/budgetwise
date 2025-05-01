import React from "react";
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
};
const PieChartCategory = () => {
  const transactions = useSelector((store) => store.transaction.transactions);
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

  const data = Object.values(groupedData).map((item) => ({
    name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    value: item.value,
    type: item.type,
    color: COLORS[item.name] || "#ccc",
  }));
  console.log(data);

  // Convert to array format for recharts
  if (data.length === 0)
    return <p className="text-gray-400">No transactions to display.</p>;
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartCategory;
