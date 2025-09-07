import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";

const InsightSummaryAreaChart = () => {
  const insights = useSelector((store) => store.insight.insights) || [];

  // Format month labels if data has ISO date or numbers
  const formattedData = insights.map((item) => ({
    ...item,
    month: item.month.slice(0, 3), // e.g., "January" -> "Jan"
  }));

  if (!formattedData.length) {
    return (
      <div className="text-center text-base-content opacity-70 py-10">
        No insights available yet. Start adding transactions!
      </div>
    );
  }

  return (
    <div className="bg-base-100 shadow-md rounded-xl p-4">
      <h2 className="text-lg font-bold mb-4">📊 Income vs Expense Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" fill="#f5f5f5" fillOpacity={1} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorIncome)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#colorExpense)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InsightSummaryAreaChart;
