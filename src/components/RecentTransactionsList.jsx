import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  removeTransaction,
  updateTransaction,
  addTransaction,
  setTotalTransactions,
} from "../utils/redux/transactionSlice";
import { toast } from "react-hot-toast";
import {
  setTotalExpenseAmount,
  setTotalIncomeAmount,
  setBalance,
  setSalary,
} from "../utils/redux/budgetSlice";
import { Link } from "react-router-dom";

const RecentTransactionsList = ({ calledFrom }) => {
  const dispatch = useDispatch();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const transactions = useSelector((store) => store.transaction.transactions);
  //   const totalExpenseAmount = useSelector(
  //     (store) => store.budget.totalExpenseAmount
  //   );
  //   const totalIncomeAmount = useSelector(
  //     (store) => store.budget.totalIncomeAmount
  //   );
  //   const totalBalance = useSelector((store) => store.budget.balance);
  let limitForTotalTransactions = useSelector(
    (store) => store.transaction.totalTransactions
  );
  //   if (calledFrom !== "history") {
  //     limitForTotalTransactions = 10; // Default limit for recent transactions
  //   }
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [idForEdit, setIdForEdit] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/user/transactions?limit=" +
            limitForTotalTransactions,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          dispatch(setBalance(data.data.balance));
          dispatch(addTransaction(data.data.transactions));
          dispatch(setTotalExpenseAmount(data.data.totalExpenseAmount));
          dispatch(setTotalIncomeAmount(data.data.totalIncomeAmount));
        }
      } catch (error) {
        console.log("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, [dispatch, limitForTotalTransactions]);

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const displayedTransactions =
    calledFrom === "history"
      ? sortedTransactions
      : sortedTransactions.slice(0, 10);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const firstOfMonth = `${yyyy}-${mm}-01`;

  const openModalForEdit = (transaction) => {
    setType(transaction.type);
    setAmount(transaction.amount);
    setCategory(transaction.category);
    setDate(new Date(transaction.date).toISOString().split("T")[0]);
    setIdForEdit(transaction._id);
    setNote(transaction.note || "");
    setEditModalOpen(true);
    // document.getElementById("my_modal_1").showModal();
  };

  useEffect(() => {
    if (editModalOpen) {
      const modal = document.getElementById("my_modal_1");
      if (modal) modal.showModal();
    }
  }, [editModalOpen]);
  const closeModal = () => {
    setEditModalOpen(false);
    document.getElementById("my_modal_1").close();
  };

  const updateTransactionCall = async () => {
    try {
      if (parseFloat(amount) <= 0) {
        toast.error("Amount must be a positive number.");
        return;
      }
      const response = await fetch(
        "http://localhost:3000/user/update/transaction/" + idForEdit,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            amount: parseFloat(amount).toFixed(2),
            category,
            date: new Date(date).toISOString().split("T")[0],
            note,
          }),
          credentials: "include",
        }
      );
      const data = await response.json();
      console.log("Update Transaction Response:", data);
      if (response.ok) {
        toast.success(data.message || "Transaction updated successfully!");
        dispatch(updateTransaction(data.data));

        closeModal();
        resetForm(data.data);
      } else {
        toast.error(data.message || "Failed to update transaction");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update transaction");
      return;
    }
  };

  const deleteAddedTransaction = async (transactionDetails) => {
    try {
      const response = await fetch(
        "http://localhost:3000/user/transaction/delete/" +
          transactionDetails._id,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await response.json();
      console.log("Delete Transaction Response:", data);
      if (response.ok) {
        toast.success(data.message || "Transaction deleted successfully!");
        dispatch(removeTransaction(transactionDetails));
      } else {
        toast.error(data.message || "Failed to delete transaction");
      }
    } catch (error) {
      toast.error(
        error.message || "Failed to delete transaction. Please try again."
      );
      return;
    }
  };

  const resetForm = (transaction) => {
    setType(transaction.type);
    setAmount(transaction.amount);
    setCategory(transaction.category);
    setDate(new Date(transaction.date).toISOString().split("T")[0]);
    setNote(transaction.note || "");
  };

  return (
    <>
      <section className="w-2/3 max-w-6xl">
        <div className=" list bg-gray-700 p-6 rounded-box shadow-md">
          {calledFrom !== "history" ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold mb-4">
                  📄 Recent 10 Transactions
                </h3>
                <Link
                  to={"/history"}
                  className="text-blue-400 text-lg hover:underline"
                >
                  View All Transactions
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link to={"/"}>
                <h3 className="text-xl font-semibold mb-4 text-blue-400  hover: underline">
                  Dashboard
                </h3>
              </Link>
            </>
          )}

          {displayedTransactions.length === 0 ? (
            <p>
              No transactions yet. please add transaction and update Income also
              from Transaction page
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
                  <div className="p-4 pb-2 bg-gray-600 text-white rounded-lg shadow flex justify-between items-center">
                    <div className="flex items-start gap-3">
                      <div className="text-xl">
                        {t.type === "income" ? "💰" : "💸"}
                      </div>
                      <div>
                        <p className="font-medium text-base">
                          {t.note || "No Note"}{" "}
                          <span className="text-sm text-gray-400">
                            ({t.category})
                          </span>
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(t.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div
                        className={`text-lg font-semibold ${
                          t.type === "income"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"} ₹{t.amount}
                      </div>
                      <div className="flex gap-2 text-sm text-gray-400">
                        <button
                          onClick={() => openModalForEdit(t)}
                          className="hover:text-blue-400 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteAddedTransaction(t)}
                          className="hover:text-red-400 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                      {/* modal for edit */}
                      {editModalOpen && (
                        <dialog id="my_modal_1" className="modal">
                          <div className="modal-box">
                            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-md border p-4">
                              <legend className="fieldset-legend font-bold text-lg">
                                Edit Transaction 📄
                              </legend>
                              <label className="label">
                                <span className="label-text">Type</span>
                              </label>
                              <select
                                className="select rounded-xl select-bordered w-full select-neutral outline-none"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                              >
                                <option disabled value="">
                                  Select Type
                                </option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                              </select>

                              <label className="label">Amount</label>
                              <input
                                type="number"
                                className="input input-neutral rounded-2xl w-full"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                              />
                              <label className="label">
                                <span className="label-text">Category</span>
                              </label>
                              <select
                                className="select rounded-xl select-bordered w-full select-neutral outline-none"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                              >
                                <option disabled value="">
                                  Select Type
                                </option>
                                <option value="need">Need</option>
                                <option value="want">Want</option>
                                <option value="investment">Investment</option>
                                <option value="other">Other</option>
                              </select>

                              <label className="label">Date</label>
                              <input
                                type="date"
                                className="input input-neutral w-full rounded-2xl"
                                value={date}
                                min={firstOfMonth}
                                max={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setDate(e.target.value)}
                              />
                              <label className="label">Note</label>
                              <input
                                type="text"
                                className="input input-neutral w-full rounded-2xl"
                                placeholder="Note (optional)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                              />
                              <div className="flex flex-row gap-4 items-center">
                                <button
                                  onClick={() => updateTransactionCall(t)}
                                  type="submit"
                                  className="btn btn-secondary rounded-4xl mt-4"
                                >
                                  Update Transaction
                                </button>
                                <button
                                  onClick={() => resetForm(t)}
                                  className="btn btn-primary rounded-4xl mt-4"
                                >
                                  Reset
                                </button>
                              </div>
                            </fieldset>
                            <div className="modal-action">
                              <form method="dialog">
                                <button
                                  onClick={closeModal}
                                  className="btn btn-primary rounded-4xl mt-4"
                                >
                                  Close
                                </button>
                              </form>
                            </div>
                          </div>
                        </dialog>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>
    </>
  );
};

export default RecentTransactionsList;
