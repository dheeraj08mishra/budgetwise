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
    <div className="flex flex-col items-center min-h-screen bg-base-200 text-base-content p-4 space-y-8">
      {/* Header Card */}
      <section className="w-full max-w-6xl space-y-6 mx-auto">
        <div className="flex justify-center">
          <div className="card w-full max-w-md bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl font-bold">
                💰 Balance: ₹ {totalBalance.toFixed(2)}
              </h2>
              <div className="flex justify-between text-sm mt-2">
                <p className="text-success">
                  Income: ₹ {totalIncome.toFixed(2)}
                </p>
                <p className="text-error">
                  Expense: ₹ {totalExpense.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-xl mb-4">📊 Category Breakdown</h3>
              <PieChartCategory />
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-xl mb-4">🎯 Budget Overview</h3>
              <Budget />
            </div>
          </div>
        </div>
      </section>

      {/* Trends Section */}
      <section className="w-full max-w-6xl">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-xl mb-4">📈 Trends (Day-wise)</h3>
            <BarChartTrends />
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <RecentTransactionsList />
    </div>
  );
};

export default MainContainer;
