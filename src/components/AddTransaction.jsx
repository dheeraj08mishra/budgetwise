import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTransaction } from "../utils/redux/transactionSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  setSalary,
  setTotalExpenseAmount,
  setTotalIncomeAmount,
  setBalance,
} from "../utils/redux/budgetSlice";
import { setTotalTransactions } from "../utils/redux/transactionSlice";
import { BASE_URL } from "../utils/constants"; // Adjust the import path as necessary

const AddTransaction = () => {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("need");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date
  const [note, setNote] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const transactions = useSelector((store) => store.transaction.transactions);
  const user = useSelector((store) => store.profile);
  const totalExpenseAmount = useSelector(
    (store) => store.budget.totalExpenseAmount
  );
  const totalIncomeAmount = useSelector(
    (store) => store.budget.totalIncomeAmount
  );
  const totalBalance = useSelector((store) => store.budget.balance);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const firstOfMonth = `${yyyy}-${mm}-01`;

  const checkFieldsValues = () => {
    if (!type || !amount || !category || !date) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Amount must be a positive number.");
      return false;
    }
    if (new Date(date) > new Date()) {
      toast.error("Date cannot be in the future.");
      return false;
    }
    return { type, amount, category, date, note };
  };

  const addTransactionList = async (e) => {
    const values = checkFieldsValues();
    if (values === false) return;

    const { type, amount, category, date, note } = values;

    if (user) {
      const payload = {
        userId: user._id,
        type,
        amount: Number(parseFloat(amount).toFixed(2)), // Ensure amount is a number with two decimal places
        category,
        date: new Date(date).toISOString().split("T")[0],
        note,
      };

      try {
        const response = await fetch(BASE_URL + "/user/addTransaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        const data = await response.json();
        console.log("Add Transaction Response:", data);
        if (response.ok) {
          dispatch(addTransaction([...transactions, data.data]));
          dispatch(setTotalTransactions(transactions.length + 1));
          if (data.data.type === "income") {
            dispatch(setSalary(data.data.amount));
          }
          if (data.data.type === "expense") {
            dispatch(
              setTotalExpenseAmount(totalExpenseAmount + data.data.amount)
            );
            dispatch(setBalance(totalBalance - data.data.amount));
          }
          if (data.data.type === "income") {
            dispatch(
              setTotalIncomeAmount(totalIncomeAmount + data.data.amount)
            );
            dispatch(setBalance(totalBalance + data.data.amount));
          }
          toast.success(response.message || "Transaction added successfully!");
          setTimeout(() => {
            navigate("/");
          }, 2000);
          resetForm();
        } else {
          toast.error(data.message || "Failed to add transaction.");
        }
      } catch (error) {
        toast.error("Failed to add transaction. Please try again.");
      }
    } else {
      setError("User not authenticated. Please log in.");
    }
  };

  const resetForm = () => {
    setType("expense");
    setAmount(0);
    setCategory("need");
    setDate(new Date().toISOString().split("T")[0]);
    setNote("");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-200 shadow-lg">
        <div className="card-body space-y-4">
          <h2 className="text-2xl font-bold text-center">Add Transaction</h2>

          {/* Type */}
          <div>
            <label className="label">
              <span className="label-text">Transaction Type</span>
            </label>
            <select
              className="select select-bordered w-full rounded-xl"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option disabled value="">
                Select Type
              </option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="label">
              <span className="label-text">Amount</span>
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              className="input input-bordered w-full rounded-xl"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              className="select select-bordered w-full rounded-xl"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option disabled value="">
                Select Category
              </option>
              <option value="need">Need</option>
              <option value="want">Want</option>
              <option value="investment">Investment</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="label">
              <span className="label-text">Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full rounded-xl"
              value={date}
              min={firstOfMonth}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Note */}
          <div>
            <label className="label">
              <span className="label-text">Note</span>
            </label>
            <input
              type="text"
              placeholder="Optional note"
              className="input input-bordered w-full rounded-xl"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              onClick={addTransactionList}
              className="btn btn-secondary rounded-xl w-[48%]"
            >
              Add
            </button>
            <button
              onClick={resetForm}
              className="btn btn-outline btn-primary rounded-xl w-[48%]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
