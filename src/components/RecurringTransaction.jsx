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
  const [actionLoading, setActionLoading] = useState({});

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
        setRecurringTransactions(
          data.data.sort(
            (a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence)
          ) || []
        );
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

  const updateTransactionState = async (transaction, event) => {
    setActionLoading((prev) => ({ ...prev, [transaction._id]: true }));
    if (event === "pause" && !transaction.isActive) {
      toast.error("Transaction is already paused.");
      setActionLoading((prev) => ({ ...prev, [transaction._id]: false }));
      return;
    }
    if (event === "resume" && transaction.isActive) {
      toast.success("Transaction is already active.");
      setActionLoading((prev) => ({ ...prev, [transaction._id]: false }));
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/recurring/${event}Transaction/${transaction._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error(`Failed to ${event} transaction`);
      const data = await response.json();
      setRecurringTransactions((prev) =>
        prev.map((t) =>
          t._id === transaction._id
            ? {
                ...t,
                isActive: data.data.isActive,
                nextOccurrence: data.data.nextOccurrence,
              }
            : t
        )
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(`Failed to ${event} transaction.`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [transaction._id]: false }));
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recurringTransactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className={!transaction.isActive ? "opacity-50" : ""}
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
                    <td>
                      <div className="flex flex-row gap-1">
                        {transaction.isActive ? (
                          <div
                            className="tooltip tooltip-info tooltip-left"
                            data-tip="Pause"
                          >
                            <button
                              className="btn btn-xs"
                              aria-label="Pause transaction"
                              disabled={actionLoading[transaction._id]}
                              onClick={() => {
                                updateTransactionState(transaction, "pause");
                              }}
                            >
                              {/* Pause SVG */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div
                            className="tooltip tooltip-primary tooltip-left"
                            data-tip="Resume"
                          >
                            <button
                              className="btn btn-xs"
                              aria-label="Resume transaction"
                              disabled={actionLoading[transaction._id]}
                              onClick={() => {
                                updateTransactionState(transaction, "resume");
                              }}
                            >
                              {/* Resume SVG */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                              </svg>
                            </button>
                          </div>
                        )}

                        {/* <div
                          className="tooltip tooltip-error tooltip-left"
                          data-tip="Delete"
                        >
                          <button
                            className="btn btn-xs"
                            aria-label="Delete transaction"
                            disabled={actionLoading[transaction._id]}
                            onClick={() => handleDelete(transaction)}
                          >
                            <svg ...>...</svg>
                          </button>
                        </div> */}
                      </div>
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
