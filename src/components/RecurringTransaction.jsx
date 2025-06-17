import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { BASE_URL } from "../utils/constants";

const PAGE_SIZE = 10;

const RecurringTransaction = () => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: null,
    previousPage: null,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecurringTransactions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/recurring/transactions?page=${page}&limit=${PAGE_SIZE}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!response.ok)
          throw new Error("Failed to fetch recurring transactions");
        const data = await response.json();
        setRecurringTransactions(data.data || []);
        setPagination(data.pagination || {});
        if (data?.message) toast.success(data.message);
      } catch (err) {
        toast.error("Could not fetch recurring transactions.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecurringTransactions();
  }, [page]);

  const typeIcon = (type) => {
    switch (type) {
      case "income":
        return "💰";
      case "expense":
        return "💸";
      case "saving":
        return "🏦";
      case "investment":
        return "📈";
      default:
        return "🔁";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Recurring Transactions
      </h2>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : recurringTransactions.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="table table-zebra table-md bg-base-100">
              <thead className="bg-base-200 text-base font-semibold sticky top-0 z-10">
                <tr>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Note</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Next Occurrence</th>
                  <th>Last Occurrence</th>
                </tr>
              </thead>
              <tbody>
                {recurringTransactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className={!transaction.isActive ? "opacity-60" : ""}
                  >
                    <td className="capitalize flex items-center gap-1">
                      <span>{typeIcon(transaction.type)}</span>
                      <span>{transaction.type}</span>
                    </td>
                    <td className="capitalize">{transaction.category}</td>
                    <td>
                      <span
                        className="text-sm opacity-80 truncate max-w-[150px] block"
                        title={transaction.note}
                      >
                        {transaction.note || "-"}
                      </span>
                    </td>
                    <td
                      className={
                        transaction.type === "income"
                          ? "text-success font-semibold"
                          : "text-error font-semibold"
                      }
                    >
                      ₹ {transaction.amount}
                    </td>
                    <td className="capitalize">
                      <span className="badge badge-info badge-sm">
                        {transaction.frequency}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm ${
                          transaction.isActive ? "badge-success" : "badge-error"
                        }`}
                      >
                        {transaction.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {transaction.startDate
                        ? new Date(transaction.startDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {transaction.nextOccurrence
                        ? new Date(
                            transaction.nextOccurrence
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {transaction.lastOccurrence
                        ? new Date(
                            transaction.lastOccurrence
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination controls */}
          <div className="join my-4 flex justify-center">
            <button
              className="join-item btn btn-sm"
              onClick={() => setPage(pagination.previousPage)}
              disabled={!pagination.hasPreviousPage}
            >
              «
            </button>
            {Array.from(
              { length: pagination.totalPages },
              (_, idx) => idx + 1
            ).map((pg) => (
              <button
                key={pg}
                className={`join-item btn btn-sm ${
                  page === pg ? "btn-active" : ""
                }`}
                onClick={() => setPage(pg)}
              >
                {pg}
              </button>
            ))}
            <button
              className="join-item btn btn-sm"
              onClick={() => setPage(pagination.nextPage)}
              disabled={!pagination.hasNextPage}
            >
              »
            </button>
          </div>
          <div className="text-center text-xs text-base-content mb-2">
            Showing page {page} of {pagination.totalPages}, total{" "}
            {pagination.totalCount} transactions.
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-40">
          <span className="text-content font-semibold text-lg">
            No Recurring Transactions Found
          </span>
        </div>
      )}
    </div>
  );
};

export default RecurringTransaction;
