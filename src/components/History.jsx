import React from "react";
import RecentTransactionsList from "./RecentTransactionsList";
import Search from "./Search";

const History = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-start w-full p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Transaction History
        </h1>
        {/* <div className="text-gray-600 mb-6 text-center"> */}

        <Search />
        {/* </div> */}
        <RecentTransactionsList calledFrom="history" />
      </div>
    </>
  );
};

export default History;
