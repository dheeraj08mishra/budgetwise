import React from "react";
const FilterByCategory = ({ category, setCategory }) => {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text text-sm font-semibold">
          Filter by Category
        </span>
      </label>
      <select
        className="select select-bordered select-neutral w-full rounded-xl"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {[
          { label: "All", value: "" },
          { label: "Need", value: "need" },
          { label: "Want", value: "want" },
          { label: "Investment", value: "investment" },
          { label: "Other", value: "other" },
        ].map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterByCategory;
