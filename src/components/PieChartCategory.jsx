import { useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Define color codes for categories
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

  // Group expense transactions by category and sum their amounts
  const groupedData = transactions.reduce((acc, transaction) => {
    if (!transaction) return acc;
    if (transaction.type === "income") return acc;
    const { category, amount, type } = transaction;
    if (!acc[category]) {
      acc[category] = { name: category, value: 0, type };
    }
    acc[category].value += amount;
    return acc;
  }, {});

  // Calculate remaining salary after all expenses
  const totalExpense = Object.values(groupedData).reduce(
    (sum, item) => sum + item.value,
    0
  );
  const remainingValue = Math.max(salary - totalExpense, 0);

  groupedData.remaining = {
    name: "remaining",
    value: remainingValue,
    type: "remaining",
  };

  let data;
  if (
    Object.values(groupedData).length === 1 &&
    Object.values(groupedData)[0].name === "remaining"
  ) {
    data = [];
  } else {
    data = Object.values(groupedData)
      .filter((item) => item.value > 0)
      .map((item) => ({
        name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        value: item.value,
        type: item.type,
        color: COLORS[item.name] || "#ccc",
      }));
  }

  if (!data.length) {
    return (
      <p className="text-gray-400 text-center">No transactions to display.</p>
    );
  }

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
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
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
