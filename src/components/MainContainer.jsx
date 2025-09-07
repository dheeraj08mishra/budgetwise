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
import InsightSummaryAreaChart from "./InsightSummaryAreaChart";
import { setInsights } from "../utils/redux/insightSlice";

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
  const [insightsValue, setInsightsValue] = useState("");
  const [records, setRecords] = useState([]);
  const [insightRecords, setInsightRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income" || t.type === "credit")
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      totalBalance: income - expense,
    };
  }, [transactions.length]);

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
        const uniqueYears = [...new Set(data.data.map(({ year }) => year))];
        const insightMonthList = uniqueYears.map((year) => ({
          label: year,
          value: year,
        }));
        const currentYear = new Date().getFullYear().toString();
        setInsightsValue(
          insightMonthList.find((opt) => opt.value === currentYear)?.value ||
            insightMonthList[0]?.value ||
            ""
        );

        setInsightRecords(insightMonthList);
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

  const exportTransactionsExcel = async () => {
    if (!selectedValue) {
      toast.error("Please select a month to export transactions.");
      return;
    }
    const [monthName, year] = selectedValue.split(" ");
    const monthNumber = monthsMap[monthName];
    if (!monthNumber || !year) {
      toast.error("Invalid month or year selected.");
      return;
    }
    try {
      const res = await fetch(
        BASE_URL +
          `/user/transactions/export/excel?month=${monthNumber}&year=${year}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        toast.error("Failed to export transactions");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `transactions_${monthName}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Transactions exported successfully!");
    } catch (error) {
      toast.error("Failed to export transactions. Please try again.");
      console.log("Export error:", error);
    }
  };

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
      } catch (err) {
        toast.error("Failed to fetch transactions. Please try again.");
      }
    };

    fetchTransactions();
  }, [selectedValue, dispatch]);

  useEffect(() => {
    if (!insightsValue) return;
    const fetchInsights = async (year) => {
      try {
        const res = await fetch(BASE_URL + "/insights/monthlySummary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ year }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch insights");
        }

        const data = await res.json();
        dispatch(setInsights(data.summary));
      } catch (err) {
        toast.error("Failed to load yearly insights.");
        setInsights([]); // clear stale data
      }
    };

    fetchInsights(insightsValue);
  }, [dispatch, insightsValue]);

  return (
    <>
      <div className="flex flex-col items-center min-h-screen bg-base-200 text-base-content p-4 space-y-8">
        <section className="w-full max-w-6xl">
          <div>
            <label className="label">
              <span className="label-text text-sm font-semibold">
                Select Year to view Insights Chart
              </span>
            </label>
            <select
              value={insightsValue}
              onChange={(e) => setInsightsValue(e.target.value)}
              disabled={isLoading}
              className="select select-bordered select-neutral w-full rounded-xl"
            >
              {isLoading ? (
                <option disabled>Loading...</option>
              ) : insightRecords.length === 0 ? (
                <option disabled>No Data Available</option>
              ) : (
                insightRecords.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <InsightSummaryAreaChart />
          )}
        </section>
        <section className="w-full max-w-6xl space-y-6 mx-auto">
          <div className="flex flex-col sm:flex-row md:flex-row justify-between items-stretch gap-6 mb-6">
            {/* Dropdown */}
            {records.length > 0 && (
              <>
                <div className="form-control w-full max-w-md">
                  {/* <div className="flex items-center mb-2"> */}
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
                  {/* </div> */}
                  <span className="form-control inline-block max-w-md p-6">
                    <button
                      className="btn btn-link text text-base-content rounded-4xl"
                      onClick={() => {
                        exportTransactionsExcel();
                      }}
                    >
                      ⬇️ Export to Excel
                    </button>
                  </span>
                </div>
              </>
            )}

            {/* Balance Card */}
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
