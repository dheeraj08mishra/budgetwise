import React from "react";

const FilterByDate = ({ fromDate, setFromDate, toDate, setToDate }) => {
  return (
    <>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text text-sm font-semibold">From Date</span>
        </label>
        <input
          type="date"
          className="input input-bordered input-neutral w-full rounded-xl"
          value={fromDate}
          max={toDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text text-sm font-semibold">To Date</span>
        </label>
        <input
          type="date"
          className="input input-bordered input-neutral w-full rounded-xl"
          value={toDate}
          min={fromDate}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>
    </>
  );
};

export default FilterByDate;
