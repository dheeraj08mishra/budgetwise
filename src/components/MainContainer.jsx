import { useSelector } from "react-redux";
import Budget from "./Budget";
import PieChartCategory from "./PieChartCategory";
import BarChartTrends from "./BarChartTrends";
import RecentTransactionsList from "./RecentTransactionsList";

const MainContainer = () => {
  const transactions = useSelector((store) => store.transaction.transactions);
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="flex flex-col items-center  min-h-screen bg-gray-900 text-white p-4 space-y-8">
      <section className="w-full max-w-6xl space-y-6 mx-auto">
        <div className="flex justify-center">
          <div className="bg-gray-700 p-6 rounded-lg shadow-md w-full max-w-md mb-6">
            <h2 className="text-2xl font-bold mb-2">
              💰 Balance: ₹ {totalBalance}
            </h2>
            <div className="flex justify-between text-sm">
              <p>Income: ₹ {totalIncome}</p>
              <p>Expense: ₹ {totalExpense}</p>
            </div>
          </div>
        </div>
        {/* section 1: pie chart and budget tracking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              📊 Category Breakdown
            </h3>
            <PieChartCategory />
          </div>

          <div>
            <Budget />
          </div>
        </div>
      </section>

      {/* Section 2: Bar Chart Trends */}
      <section className="w-full max-w-6xl">
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">📈 Trends Day wise</h3>
          <BarChartTrends />
        </div>
      </section>

      {/* Section 3: Recent Transactions */}
      <RecentTransactionsList />
    </div>
  );
};

export default MainContainer;
