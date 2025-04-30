import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../utils/firebase";
import { addTransaction } from "../utils/redux/transactionSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AddTransaction = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user.currentUser);
  const transactions = useSelector((store) => store.transaction.transactions);

  const typeRef = useRef("expense");
  const amountRef = useRef(0);
  const categoryRef = useRef("need");
  const dateRef = useRef(Date.now());
  const noteRef = useRef("");

  const checkFieldsValues = () => {
    const type = typeRef.current.value;
    const amount = amountRef.current.value;
    const category = categoryRef.current.value;
    const date = dateRef.current.value;
    const note = noteRef.current.value;

    if (!type || !amount || !category || !date) {
      setError("Please fill in all required fields.");
      return false;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Amount must be a positive number.");
      return false;
    }
    if (new Date(date) > new Date()) {
      setError("Date cannot be in the future.");
      return false;
    }
    return { type, amount, category, date, note };
  };

  const addTransactionList = async (e) => {
    e.preventDefault();
    const values = checkFieldsValues();
    if (values === false) return;

    const { type, amount, category, date, note } = values;

    const user = auth.currentUser;
    if (user) {
      const transaction = {
        id: uuidv4(),
        type,
        amount: parseFloat(amount),
        category,
        date: new Date(date).toISOString(),
        note: note || "",
      };

      try {
        await addDoc(collection(db, "users", user.uid, "transactions"), {
          ...transaction,
          createdAt: serverTimestamp(),
        });
        dispatch(
          addTransaction([
            ...transactions,
            {
              ...transaction,
              createdAt: new Date().toISOString(),
            },
          ])
        );

        // Reset form
        typeRef.current.value = "expense";
        amountRef.current.value = "";
        categoryRef.current.value = "need";
        dateRef.current.value = "";
        noteRef.current.value = "";
        setError("");
        toast.success("Transaction added successfully!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
        // setSuccess("Transaction added successfully!");
        // navigate("/");
      } catch (error) {
        console.error("Error adding transaction: ", error);
        setError("Failed to add transaction. Please try again.");
      }
    } else {
      setError("User not authenticated. Please log in.");
    }
  };

  const resetForm = (e) => {
    e.preventDefault();
    typeRef.current.value = "expense";
    amountRef.current.value = "";
    categoryRef.current.value = "need";
    dateRef.current.value = "";
    noteRef.current.value = "";
    setError("");
    setSuccess("");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
      <form className="bg-gray-700 p-6 rounded-lg shadow-md w-80">
        {/* Type */}
        <div className="mb-4">
          <select
            ref={typeRef}
            className="w-full p-2 bg-gray-600 text-white rounded"
            defaultValue="expense"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <input
            type="number"
            placeholder="Amount"
            ref={amountRef}
            className="w-full p-2 bg-gray-600 text-white rounded"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <select
            ref={categoryRef}
            className="w-full p-2 bg-gray-600 text-white rounded"
            defaultValue="need"
          >
            <option value="" disabled>
              Select Category
            </option>
            <option value="need">Need</option>
            <option value="want">Want</option>
            <option value="investment">Investment</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Date */}
        <div className="mb-4">
          <input
            type="date"
            ref={dateRef}
            className="w-full p-2 bg-gray-600 text-white rounded"
          />
        </div>

        {/* Note */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Note (optional)"
            ref={noteRef}
            className="w-full p-2 bg-gray-600 text-white rounded"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={addTransactionList}
            className="bg-cyan-900 px-4 py-2 rounded mt-4 w-full"
          >
            Save
          </button>
          <button
            onClick={resetForm}
            className="bg-red-500 px-4 py-2 rounded mt-4 w-full"
          >
            Cancel
          </button>
        </div>

        {/* Messages */}
        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
        {success && (
          <div className="mt-4 text-green-500 text-sm">{success}</div>
        )}
      </form>
    </div>
  );
};

export default AddTransaction;
