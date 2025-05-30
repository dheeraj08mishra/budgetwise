import React from "react";

const SortingFilter = ({ sortBy, setSortBy }) => {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text text-sm font-semibold">Sort by</span>
      </label>
      <select
        className="select select-neutral w-full rounded-xl"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        {[
          { label: "Default", value: "" },
          { label: "Newest to Oldest", value: "newestToOldest" },
          { label: "Oldest to Newest", value: "oldestToNewest" },
          { label: "Highest to Lowest (Amount)", value: "highestToLowest" },
          { label: "Lowest to Highest (Amount)", value: "lowestToHighest" },
        ].map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortingFilter;
