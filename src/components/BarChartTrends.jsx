import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

const BarChartTrends = () => {
  const transactions = useSelector((store) => store.transaction.transactions);

  // Group and sort data by date
  const data = useMemo(() => {
    const grouped = {};
    for (const transaction of transactions) {
      if (!transaction || transaction.type === "income") continue;
      const date = dayjs(transaction.date).format("MMM D");
      grouped[date] = (grouped[date] || 0) + transaction.amount;
    }
    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => dayjs(a.date, "MMM D").diff(dayjs(b.date, "MMM D")));
  }, [transactions]);

  const minBars = 5;
  let displayData = [...data];
  if (data.length < minBars) {
    const dummies = Array.from({ length: minBars - data.length }, () => ({
      date: "",
      amount: 0,
    }));
    displayData = [...data, ...dummies];
  }

  if (data.length === 0)
    return <p className="text-gray-400">No transactions to display.</p>;

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={displayData}
          barCategoryGap={data.length < minBars ? "80%" : "10%"}
          barGap={data.length < minBars ? 10 : 4}
        >
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
