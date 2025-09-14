import React from "react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
} from "recharts";
import { useSelector } from "react-redux";

const InsightSummaryAreaChart = () => {
  const insights = useSelector((store) => store.insight.insights) || [];
  const anomalies = useSelector((store) => store.insight.anomalies) || [];

  if (!anomalies.length && !insights.length) {
    return (
      <div className="text-center text-base-content opacity-70 py-10">
        No insights available yet. Start adding transactions!
      </div>
    );
  }

  return (
    <div className="bg-base-100 shadow-md rounded-xl p-4">
      <h2 className="text-lg font-bold mb-4">📊 Income vs Expense Trend</h2>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart
          data={anomalies}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e0e0e0"
            fill="#f9f9f9"
            fillOpacity={0.8}
          />
          <XAxis dataKey="month" />

          {/* Y-Axis scaling */}
          <YAxis
            domain={[0, "dataMax + 200000"]}
            tickCount={10}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />

          {/* let's add custom tooltip where income, expenses and anomalies are displayed */}
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;

              const { income, expense, month } = payload[0].payload;

              return (
                <div className=" p-4 shadow-lg rounded-lg border-0 bg-amber-500">
                  <h4> Month:{month}</h4>
                  <p>Income: ₹{income}</p>
                  <p>Expense: ₹{expense}</p>

                  {(payload[0].payload.method === "rollingAvg" ||
                    payload[0].payload.method === "previous") && (
                    <p>
                      Anomaly Percentage:{" "}
                      {payload[0].payload.percentChange || 0}%
                    </p>
                  )}
                  {payload[0].payload.method === "rollingAvg" && (
                    <p>Rolling Average: {payload[0].payload.rollingAvg || 0}</p>
                  )}
                  {payload[0].payload.method === "zScore" && (
                    <p>Z-Score: {payload[0].payload.zScore || 0}</p>
                  )}
                </div>
              );
            }}
          />

          {/* Income vs Expense Areas */}
          <Area
            type="monotone"
            dataKey="income"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.8}
            name="Income"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.8}
            name="Expense"
          />

          {/* Scatter for anomalies */}
          <Scatter
            data={anomalies}
            dataKey="expense"
            name="Anomalies"
            shape={(props) => {
              const { cx, cy, payload } = props;
              const color =
                payload.anomaly === "spike"
                  ? "red"
                  : payload.anomaly === "drop"
                  ? "blue"
                  : "gray";
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InsightSummaryAreaChart;
