import React, { useState } from "react";
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

const AddTransaction = () => {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("need");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date
  const [note, setNote] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const transactions = useSelector((store) => store.transaction.transactions);
  const user = useSelector((store) => store.user.currentUser);
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
        amount: parseFloat(amount).toFixed(2), // Ensure amount is a number with two decimal places
        category,
        date: new Date(date).toISOString().split("T")[0],
        note,
      };

      try {
        const response = await fetch(
          "http://localhost:3000/user/addTransaction",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: "include",
          }
        );

        const data = await response.json();
        console.log("Add Transaction Response:", data);
        if (response.ok) {
          dispatch(addTransaction([...transactions, data.data]));
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
    <div className="hero bg-base-100 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
              <legend className="fieldset-legend">Add Transaction</legend>
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
                className="input input-neutral rounded-2xl"
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
                className="input input-neutral rounded-2xl"
                value={date}
                min={firstOfMonth}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
              />
              <label className="label">Note</label>
              <input
                type="text"
                className="input input-neutral rounded-2xl"
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex flex-row gap-4 items-center">
                <button
                  onClick={addTransactionList}
                  type="submit"
                  className="btn btn-secondary rounded-4xl mt-4"
                >
                  Add Transaction
                </button>
                <button
                  onClick={resetForm}
                  className="btn btn-primary rounded-4xl mt-4"
                >
                  Reset Details
                </button>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
