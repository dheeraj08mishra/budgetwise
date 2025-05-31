import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  removeTransaction,
  updateTransaction,
  addTransaction,
} from "../utils/redux/transactionSlice";
import {
  setTotalExpenseAmount,
  setTotalIncomeAmount,
  setBalance,
} from "../utils/redux/budgetSlice";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const RecentTransactionsList = ({ calledFrom }) => {
  const dispatch = useDispatch();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [recordPerPages, setRecordPerPages] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const transactions = useSelector((store) => store.transaction.transactions);
  const totalTransactionsLimit = useSelector(
    (store) => store.transaction.totalTransactions
  );

  const [form, setForm] = useState({
    type: "",
    amount: "",
    category: "",
    date: "",
    note: "",
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          BASE_URL + `/user/transactions?limit=${totalTransactionsLimit}`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        if (res.ok) {
          dispatch(setBalance(data.data.balance));
          dispatch(addTransaction(data.data.transactions));
          dispatch(setTotalExpenseAmount(data.data.totalExpenseAmount));
          dispatch(setTotalIncomeAmount(data.data.totalIncomeAmount));
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, [dispatch, totalTransactionsLimit]);

  useEffect(() => {
    setCurrentPage(1);
    setRecordPerPages(25);
  }, [transactions]);

  const totalPages = Math.ceil(transactions.length / recordPerPages);
  let displayedTransactions =
    calledFrom === "history"
      ? transactions.slice(
          (currentPage - 1) * recordPerPages,
          currentPage * recordPerPages
        )
      : transactions.slice(0, 10);
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }
  };
  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    }
  };

  const openModalForEdit = (transaction) => {
    setEditModalOpen(true);
    setEditData(transaction);
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: new Date(transaction.date).toISOString().split("T")[0],
      note: transaction.note || "",
    });
  };

  const closeModal = () => {
    setEditModalOpen(false);
    setEditData(null);
  };

  const updateTransactionCall = async () => {
    const { type, amount, category, date, note } = form;
    if (parseFloat(amount) <= 0) {
      toast.error("Amount must be a positive number.");
      return;
    }

    try {
      const res = await fetch(
        BASE_URL + `/user/update/transaction/${editData._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            amount: Number(parseFloat(amount).toFixed(2)),
            category,
            date,
            note,
          }),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        dispatch(updateTransaction(data.data));
        toast.success(data.message || "Transaction updated!");
        closeModal();
      } else {
        toast.error(data.message || "Failed to update transaction");
      }
    } catch (err) {
      toast.error(err.message || "Error updating transaction");
    }
  };

  const deleteAddedTransaction = async (t) => {
    try {
      const res = await fetch(BASE_URL + `/user/transaction/delete/${t._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(removeTransaction(t));
        toast.success(data.message || "Transaction deleted");
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <>
      <section className="w-full max-w-4xl mx-auto px-4">
        <div className="bg-base-200 p-6 rounded-box shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <h3 className="text-lg sm:text-xl font-bold">
              {calledFrom !== "history"
                ? "📄 Recent 10 Transactions"
                : "📋 All Transactions"}
            </h3>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {calledFrom === "history" && (
                <>
                  <label className="label text-sm sm:text-base">
                    Records per page:
                  </label>
                  <select
                    className="select select-sm sm:select-md select-bordered select-neutral w-full sm:w-auto"
                    value={recordPerPages}
                    onChange={(e) => {
                      setRecordPerPages(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    {[10, 25, 50, 100].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <Link
              to={calledFrom !== "history" ? "/history" : "/"}
              className="btn btn-sm sm:btn-md btn-link text-base-content"
            >
              {calledFrom !== "history" ? "View All →" : "← Dashboard"}
            </Link>
          </div>

          {displayedTransactions.length === 0 ? (
            <p className="text-gray-500">
              No transactions yet. Please add some.
            </p>
          ) : (
            <AnimatePresence>
              {displayedTransactions.map((t) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="mb-3"
                >
                  <div className="card bg-base-100 shadow-md text-base-content">
                    <div className="card-body flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-8 p-4">
                      <div className="flex items-start gap-3 sm:gap-4 w-full">
                        <div className="text-2xl">
                          {t.type === "income" ? "💰" : "💸"}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm sm:text-base">
                            {t.note || "No Note"}{" "}
                            <span className="text-xs text-gray-400">
                              ({t.category})
                            </span>
                          </h4>
                          <p className="text-xs text-gray-500">
                            {new Date(t.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1">
                        <p
                          className={`font-semibold text-sm sm:text-lg ${
                            t.type === "income" ? "text-success" : "text-error"
                          }`}
                        >
                          {t.type === "income" ? "+" : "-"} ₹{t.amount}
                        </p>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openModalForEdit(t)}
                            className="btn btn-xs btn-ghost btn-info"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteAddedTransaction(t)}
                            className="btn btn-xs btn-ghost btn-error"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {editModalOpen && (
        <dialog id="my_modal_1" className="modal modal-open">
          <div className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Edit Transaction 📄</h3>

            <button
              className="btn float-end btn-sm btn-circle outline-none btn-error absolute top-2 right-2"
              onClick={closeModal}
            >
              ✖️
            </button>

            <div className="space-y-4">
              <select
                className="select select-sm rounded-xl select-bordered w-full select-neutral outline-none"
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option disabled value="">
                  Select Type
                </option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <input
                type="number"
                placeholder="Amount"
                className="input input-sm input-bordered w-full rounded-xl input-neutral outline-none"
                min="0"
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
              />

              <select
                className="select select-sm rounded-xl select-bordered w-full select-neutral outline-none"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option disabled value="">
                  Select Category
                </option>
                <option value="need">Need</option>
                <option value="want">Want</option>
                <option value="investment">Investment</option>
                <option value="other">Other</option>
              </select>

              <input
                type="date"
                className="input input-sm input-bordered w-full rounded-xl input-neutral outline-none"
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }
              />

              <input
                type="text"
                placeholder="Note"
                className="input input-sm input-bordered w-full rounded-xl input-neutral outline-none"
                value={form.note}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, note: e.target.value }))
                }
              />
            </div>

            <div className="modal-action mt-4">
              <button
                className="btn btn-primary rounded-2xl"
                onClick={updateTransactionCall}
              >
                Save
              </button>
              <button
                className="btn btn-secondary rounded-2xl"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}

      {calledFrom === "history" && (
        <div className=" flex justify-center items-center join gap-4 p-4 mb-6">
          <button
            onClick={previousPage}
            className={`join-item btn btn-lg btn-primary  ${
              currentPage === 1 ? "btn-disabled" : ""
            }`}
          >
            «
          </button>
          <button className={`join-item btn btn-lg btn-secondary`}>
            Page<strong> {currentPage} </strong> of {totalPages}
          </button>
          <button
            onClick={nextPage}
            className={`join-item btn btn-lg btn-primary ${
              currentPage === totalPages ? "btn-disabled" : ""
            }`}
          >
            »
          </button>
        </div>
      )}
    </>
  );
};

export default RecentTransactionsList;
