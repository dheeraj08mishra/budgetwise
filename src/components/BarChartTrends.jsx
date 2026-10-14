import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useSelector } from "react-redux";
import { dayKey, formatDay } from "../utils/dates";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className=" p-2 border rounded shadow-md text-sm">
        <p>
          <strong>Date:</strong> {label}
        </p>
        <p>
          <strong>Amount:</strong> ₹{data.amount}
        </p>
      </div>
    );
  }
  return null;
};

const BarChartTrends = () => {
  const transactions = useSelector((store) => store.transaction.transactions);

  // Daily expense totals, sorted by the real date (not the "Oct 5" label)
  const data = useMemo(() => {
    const grouped = {};
    for (const t of transactions) {
      if (!t || t.type !== "expense") continue;
      const key = dayKey(t.date);
      if (!grouped[key]) {
        grouped[key] = {
          key,
          amount: 0,
          date: formatDay(t.date, { year: undefined }),
        };
      }
      grouped[key].amount += t.amount;
    }
    return Object.values(grouped).sort((a, b) => a.key.localeCompare(b.key));
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
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <LineChart
          width={700}
          height={400}
          data={displayData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
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
  );
};

export default BarChartTrends;
