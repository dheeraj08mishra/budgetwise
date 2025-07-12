import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addTransaction,
  addRecurringTransaction,
  setTotalTransactions,
} from "../utils/redux/transactionSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  setSalary,
  setTotalExpenseAmount,
  setTotalIncomeAmount,
  setBalance,
} from "../utils/redux/budgetSlice";
import { BASE_URL } from "../utils/constants";
import {
  isAfter,
  isBefore,
  startOfMonth,
  endOfDay,
  format,
  parseISO,
} from "date-fns";
const getTodayUTCDateString = () => {
  return new Date().toISOString().slice(0, 10);
};

const AddTransaction = () => {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("need");
  const [date, setDate] = useState(getTodayUTCDateString());
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const transactions = useSelector((store) => store.transaction.transactions);
  const recurringTransactions = useSelector(
    (store) => store.transaction.recurringTransactions
  );
  const user = useSelector((store) => store.profile);
  const totalExpenseAmount = useSelector(
    (store) => store.budget.totalExpenseAmount
  );
  const totalIncomeAmount = useSelector(
    (store) => store.budget.totalIncomeAmount
  );
  const totalBalance = useSelector((store) => store.budget.balance);

  const today = new Date();
  const firstOfMonthDate = startOfMonth(today);
  const firstOfMonth = format(firstOfMonthDate, "yyyy-MM-dd");

  const checkFieldsValues = () => {
    if (!type || !category || !date) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    if (amount === "" || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Amount must be a positive number.");
      return false;
    }
    if (parseFloat(amount) > 1000000) {
      toast.error("Amount cannot exceed 1,000,000.");
      return false;
    }

    const dateValue = parseISO(date);
    const todayValue = endOfDay(today);
    const firstOfMonthValue = startOfMonth(today);

    if (isAfter(dateValue, todayValue)) {
      toast.error("Date cannot be in the future.");
      return false;
    }
    if (isBefore(dateValue, firstOfMonthValue)) {
      toast.error("Date must be within the current month.");
      return false;
    }

    if (isRecurring && !frequency) {
      toast.error("Please select a frequency for recurring transactions.");
      return false;
    }

    return { type, amount, category, date, note, isRecurring, frequency };
  };

  const addTransactionList = async (e) => {
    if (loading) return; // Prevent double submission
    setLoading(true);

    const values = checkFieldsValues();
    if (values === false) {
      setLoading(false);
      return;
    }

    const { type, amount, category, date, note, isRecurring, frequency } =
      values;

    if (user) {
      const payload = {
        userId: user._id,
        type,
        amount: parseFloat(amount).toFixed(2),
        category,
        date,
        note,
        isRecurring,
        frequency,
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
        if (response.ok) {
          dispatch(addTransaction([...transactions, data.data]));
          if (isRecurring) {
            dispatch(
              addRecurringTransaction([
                ...recurringTransactions,
                data.recurring,
              ])
            );
          }
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

          // will add transaction tags

          const tagResponse = await fetch(
            BASE_URL + `/extractTags/${data.data._id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );

          const tagData = await tagResponse.json();
          if (tagData.ok) {
            dispatch(addTransaction([...transactions, data.data]));
          }

          toast.success(data.message || "Transaction added successfully!");
          resetForm();
          navigate("/");
        } else {
          toast.error(data.message || "Failed to add transaction.");
        }
      } catch (error) {
        toast.error("Failed to add transaction. Please try again.");
      }
    } else {
      toast.error("User not authenticated. Please log in.");
    }
    setLoading(false); // Re-enable button after request completes
  };

  const resetForm = () => {
    setType("expense");
    setAmount(0);
    setCategory("need");
    setDate(getTodayUTCDateString());
    setNote("");
  };

  const updateRecurring = () => {
    return (e) => {
      setIsRecurring(e.target.checked);
      if (!e.target.checked) {
        setFrequency("");
      }
    };
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
              className="select select-neutral w-full rounded-xl"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
            >
              <option disabled value="">
                Select Type
              </option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          {/* isRecurring check */}

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">
                Is this a recurring transaction?
              </span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={isRecurring}
                onChange={updateRecurring()}
                disabled={loading}
              />
            </label>

            {isRecurring && (
              <div>
                <label className="label">
                  <span className="label-text">Frequency</span>
                </label>
                <select
                  className="select select-neutral w-full rounded-xl"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  disabled={loading}
                >
                  <option disabled value="">
                    Select Frequency
                  </option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>
          {/* Amount */}
          <div>
            <label className="label">
              <span className="label-text">Amount</span>
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              className="input input-neutral w-full rounded-xl"
              value={amount}
              min="1"
              max="1000000"
              onChange={(e) => {
                const val = e.target.value;
                if (
                  val === "" ||
                  (/^\d+(\.\d{0,2})?$/.test(val) && parseFloat(val) <= 1000000)
                ) {
                  setAmount(val);
                }
              }}
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              className="select select-neutral w-full rounded-xl"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
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
              className="input input-neutral w-full rounded-xl"
              value={date}
              min={firstOfMonth}
              max={getTodayUTCDateString()}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
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
              className="input input-neutral w-full rounded-xl"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              onClick={addTransactionList}
              className="btn btn-secondary rounded-xl w-[48%]"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
            <button
              onClick={resetForm}
              className="btn btn-outline btn-primary rounded-xl w-[48%]"
              disabled={loading}
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
