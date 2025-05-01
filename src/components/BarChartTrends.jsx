import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

const BarChartTrends = () => {
  const transactions = useSelector((store) => store.transaction.transactions);
  // group transactions by date
  const groupedData = transactions.reduce((acc, transaction) => {
    if (!transaction) return acc;
    if (transaction.type === "income") return acc;

    const date = dayjs(transaction.createdAt).format("MMM D");
    if (!acc[date]) acc[date] = 0;
    acc[date] += transaction.amount;
    return acc;
  }, {});
  const data = Object.entries(groupedData).map(([date, amount]) => ({
    date,
    amount,
  }));
  if (data.length === 0)
    return <p className="text-gray-400">No transactions to display.</p>;
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#60A5FA" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartTrends;
