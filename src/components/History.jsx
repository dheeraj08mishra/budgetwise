import React from "react";
import RecentTransactionsList from "./RecentTransactionsList";

const History = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
      <RecentTransactionsList calledFrom={"history"} />
    </div>
  );
};

export default History;
