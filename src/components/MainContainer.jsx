import { useSelector, useDispatch } from "react-redux";
import Budget from "./Budget";
import PieChartCategory from "./PieChartCategory";
import BarChartTrends from "./BarChartTrends";
import RecentTransactionsList from "./RecentTransactionsList";
import { useEffect, useState, useMemo } from "react";
import { addTransaction } from "../utils/redux/transactionSlice";
import { toast } from "react-hot-toast";
import { setSalary } from "../utils/redux/budgetSlice";
import { BASE_URL } from "../utils/constants";

// Map for month names to month numbers
const monthsMap = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

const MainContainer = () => {
  const dispatch = useDispatch();
  const transactions = useSelector((store) => store.transaction.transactions);

  const [selectedValue, setSelectedValue] = useState("");
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      totalBalance: income - expense,
    };
  }, [transactions]);

  useEffect(() => {
    const fetchMonthList = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(BASE_URL + "/user/transaction/dataMonthList", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch month list");
        const data = await res.json();

        const monthList = data.data.map(({ month, year }) => ({
          label: `${month} ${year}`,
          value: `${month} ${year}`,
        }));

        setRecords(monthList);
        const now = new Date();
        const currentMonthLabel = `${now.toLocaleString("default", {
          month: "long",
        })} ${now.getFullYear()}`;

        const currentMonthInList = monthList.find(
          (item) => item.value === currentMonthLabel
        );
        if (currentMonthInList) {
          setSelectedValue(currentMonthLabel);
        } else if (monthList.length > 0) {
          setSelectedValue(monthList[0].value);
        }
      } catch (err) {
        toast.error("Error loading available months.");
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthList();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedValue) return;

      const [monthName, year] = selectedValue.split(" ");
      const monthNumber = monthsMap[monthName];

      if (!monthNumber || !year) return;

      try {
        const res = await fetch(
          BASE_URL +
            `/user/transactions/monthly?month=${monthNumber}&year=${year}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!res.ok) {
          toast.error("Failed to fetch transactions for the selected month");
          return;
        }

        const data = await res.json();
        dispatch(addTransaction(data.data.transactions));
        const salary =
          data.data.transactions.find(
            (record) => record.type === "income" && record.category === "other"
          )?.amount || 0;
        dispatch(setSalary(salary));
        toast.success(`Fetched ${data.data.transactions.length} transactions`);
      } catch (err) {
        toast.error("Failed to fetch transactions. Please try again.");
      }
    };

    fetchTransactions();
  }, [selectedValue, dispatch]);

  return (
    <>
      <div className="flex flex-col items-center min-h-screen bg-base-200 text-base-content p-4 space-y-8">
        <section className="w-full max-w-6xl space-y-6 mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="form-control w-md">
              <label className="label">
                <span className="label-text text-sm font-semibold">
                  Select data to view Dashboard
                </span>
              </label>
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                disabled={isLoading}
                className="select select-bordered select-neutral w-full rounded-xl"
              >
                {isLoading ? (
                  <option disabled>Loading...</option>
                ) : records.length === 0 ? (
                  <option disabled>No Data Available</option>
                ) : (
                  records.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))
                )}
              </select>
            </div>

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
                <h3 className="card-title text-xl mb-4">
                  📊 Category Breakdown
                </h3>
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

        <section className="w-full max-w-6xl">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-xl mb-4">📈 Trends (Day-wise)</h3>
              <BarChartTrends />
            </div>
          </div>
        </section>

        <RecentTransactionsList />
      </div>
    </>
  );
};

export default MainContainer;
