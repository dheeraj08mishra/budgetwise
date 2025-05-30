import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

const BarChartTrends = () => {
  const transactions = useSelector((store) => store.transaction.transactions);

  const data = useMemo(() => {
    const grouped = {};
    for (const t of transactions) {
      if (!t || t.type === "income") continue;
      const date = dayjs(t.date).format("MMM D");
      grouped[date] = (grouped[date] || 0) + t.amount;
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
    return <p className="text-gray-400 text-center">No expense trends yet.</p>;

  return (
    <>
      <div className="w-full h-[300px]">
        {/* <ResponsiveContainer>
          <BarChart
            data={displayData}
            barCategoryGap={data.length < minBars ? "80%" : "10%"}
            barGap={data.length < minBars ? 10 : 4}
          >
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#60A5FA" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer> */}

        <ResponsiveContainer>
          <LineChart
            width={700}
            height={400}
            data={displayData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {/* <CartesianGrid strokeDasharray="1 1" /> */}
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default BarChartTrends;
