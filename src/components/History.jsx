import React from "react";
import RecentTransactionsList from "./RecentTransactionsList";

const History = () => {
  return (
    <div className="flex flex-col items-center justify-start w-full p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Transaction History
      </h1>
      <RecentTransactionsList calledFrom="history" />
    </div>
  );
};

export default History;
