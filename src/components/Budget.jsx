import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Budget = () => {
  const navigate = useNavigate();
  const salary = useSelector((state) => state.budget.salary);
  const transactions = useSelector((state) => state.transaction.transactions);
  const user = useSelector((state) => state.profile.currentUser);

  const [needAmount, setNeedAmount] = useState(0);
  const [wantAmount, setWantAmount] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [otherAmount, setOtherAmount] = useState(0);
  const [needSpent, setNeedSpent] = useState(0);
  const [wantSpent, setWantSpent] = useState(0);
  const [investmentSpent, setInvestmentSpent] = useState(0);
  const [otherSpent, setOtherSpent] = useState(0);

  useEffect(() => {
    if (!user) return;

    let need = 0,
      want = 0,
      investment = 0;
    let other = 0;
    transactions.forEach((transaction) => {
      if (transaction.userId === user._id && transaction.type === "expense") {
        if (transaction.category === "need") {
          need += transaction.amount;
        } else if (transaction.category === "want") {
          want += transaction.amount;
        } else if (transaction.category === "investment") {
          investment += transaction.amount;
        } else if (transaction.category === "other") {
          other += transaction.amount;
        }
      }
    });

    setNeedAmount(need);
    setWantAmount(want);
    setInvestmentAmount(investment);
    setOtherAmount(other);

    if (salary === 0) {
      setNeedSpent(0);
      setWantSpent(0);
      setInvestmentSpent(0);
      setOtherSpent(0);
      return;
    }

    setNeedSpent(Math.round((need / salary) * 100));
    setWantSpent(Math.round((want / salary) * 100));
    setInvestmentSpent(Math.round((investment / salary) * 100));
    setOtherSpent(Math.round((other / salary) * 100));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-700 p-6 rounded-xl flex-1 text-center">
        <p>No Transaction found, please add Transactions</p>
        <button
          className="btn btn-primary mt-4"
          onClick={() => navigate("/transactions")}
        >
          Transaction
        </button>
      </div>
    );
  }
  if (salary === 0) {
    return (
      <div className="bg-gray-700 p-6 rounded-xl flex-1 text-center">
        <p>Please set your salary to track your budget.</p>
        <button
          className="btn btn-primary mt-4"
          onClick={() => navigate("/transactions")}
        >
          Transaction
        </button>
      </div>
    );
  }

  return (
    <>
      <fieldset className="fieldset w-full p-4 border border-base-300 rounded-lg">
        {[
          { label: "Need", value: needSpent, amount: needAmount },
          { label: "Want", value: wantSpent, amount: wantAmount },
          {
            label: "Investment",
            value: investmentSpent,
            amount: investmentAmount,
          },
          {
            label: "Other",
            value: otherSpent,
            amount: otherAmount,
          },
        ].map((item) => (
          <div key={item.label} className="mb-4">
            <div className="flex justify-between mb-1 text-sm font-medium">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <progress
              className={`progress  w-full ${
                item.value <= 50
                  ? "progress-success"
                  : item.value <= 70
                  ? "progress-warning"
                  : "progress-error"
              }`}
              value={item.value}
              max="100"
            ></progress>
            <p className="text-xs mt-1 text-gray-500">₹{item.amount} spent</p>
          </div>
        ))}
      </fieldset>
    </>
  );
};

export default Budget;
