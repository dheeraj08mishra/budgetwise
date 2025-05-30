import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Search = ({ searchInput, setSearchInput }) => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((store) => store.profile.currentUser);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn]);

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text text-sm font-semibold">Search by Note</span>
      </label>
      <input
        type="search"
        id="note"
        placeholder="e.g. groceries, rent..."
        className="input input-bordered input-neutral w-full rounded-xl"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      />
    </div>
  );
};

export default Search;
