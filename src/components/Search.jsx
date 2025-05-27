import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { addTransaction } from "../utils/redux/transactionSlice";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const Search = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const isLoggedIn = useSelector((store) => store.profile.currentUser);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn]);

  const handleSearch = async (query) => {
    try {
      const trimmedQuery = query.toLowerCase().trim();
      if (!trimmedQuery) return;

      const response = await fetch(
        "http://localhost:3000/filter/note?note=" + trimmedQuery,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();

      if (response.ok) {
        toast.success(`Found ${data.data.length} matching transactions`);
        dispatch(addTransaction(data.data));
      } else {
        toast.error(data.message || "Failed to fetch transactions");
      }
    } catch (error) {
      toast.error("An error occurred while searching. Please try again.");
    }
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 1000), []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  return (
    <div className="flex items-center justify-center w-full mb-4">
      <label className="input">
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          type="search"
          id="note"
          placeholder="Search"
          className="w-full rounded-4xl"
          value={searchInput}
          onChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch(searchInput);
            }
          }}
        />
      </label>
      <button
        className="btn btn-primary ml-2 rounded-4xl"
        onClick={() => handleSearch(searchInput)}
      >
        Search
      </button>
    </div>
  );
};

export default Search;
