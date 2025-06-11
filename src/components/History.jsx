import React, { useEffect, useCallback, useState } from "react";
import RecentTransactionsList from "./RecentTransactionsList";
import Search from "./Search";
import FilterByCategory from "./FilterByCategory";
import toast from "react-hot-toast";
import { addTransaction } from "../utils/redux/transactionSlice";
import { useDispatch } from "react-redux";
import FilterByDate from "./FilterByDate";
import SortingFilter from "./SortingFilter";
import { BASE_URL } from "../utils/constants";
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const History = () => {
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]); // Default to today
  const [sortBy, setSortBy] = useState("");
  const dispatch = useDispatch();

  const fetchTransactions = useCallback(
    debounce(async (note, cat, selectedFromDate, selectedToDate, sort) => {
      try {
        const endPoint = BASE_URL + "/filter?";
        let queryParams = [];
        if (note) {
          queryParams.push(`note=${encodeURIComponent(note)}`);
        }
        if (cat) {
          queryParams.push(`category=${encodeURIComponent(cat)}`);
        }
        if (selectedFromDate) {
          queryParams.push(`fromDate=${encodeURIComponent(selectedFromDate)}`);
        }
        if (selectedToDate) {
          queryParams.push(`toDate=${encodeURIComponent(selectedToDate)}`);
        }
        if (sort) {
          queryParams.push(`sort=${encodeURIComponent(sort)}`);
        }
        const url = queryParams.length
          ? `${endPoint}${queryParams.join("&")}`
          : BASE_URL + "/user/transactions";
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          toast.success(`Found ${data.data.transactions.length} transactions`);
          dispatch(addTransaction(data.data.transactions));
        } else {
          toast.error(data.message || "Failed to fetch transactions");
        }
      } catch (error) {
        toast.error("Failed to fetch transactions. Please try again.");
      }
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    const note = searchInput.trim();
    const cat = category.toLowerCase();
    fetchTransactions(note, cat, fromDate, toDate, sortBy);
  }, [category, searchInput, fromDate, toDate, sortBy]);

  return (
    <>
      <div className="flex flex-col items-center w-full p-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-content">
          Transaction History
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mb-6">
          <Search searchInput={searchInput} setSearchInput={setSearchInput} />
          <FilterByCategory category={category} setCategory={setCategory} />
          <FilterByDate
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
          />
          <SortingFilter sortBy={sortBy} setSortBy={setSortBy} />
        </div>

        <RecentTransactionsList calledFrom="history" />
      </div>
    </>
  );
};

export default History;
