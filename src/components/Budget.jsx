import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Budget = () => {
  const navigate = useNavigate();
  const salary = useSelector((state) => state.budget.salary);
  const transactions = useSelector((state) => state.transaction.transactions);
  const user = useSelector((state) => state.user.currentUser);

  const [needAmount, setNeedAmount] = useState(0);
  const [wantAmount, setWantAmount] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [needSpent, setNeedSpent] = useState(0);
  const [wantSpent, setWantSpent] = useState(0);
  const [investmentSpent, setInvestmentSpent] = useState(0);

  useEffect(() => {
    if (!user) return;

    let need = 0,
      want = 0,
      investment = 0;
    transactions.forEach((transaction) => {
      if (transaction.userId === user._id) {
        if (transaction.category === "need") {
          need += transaction.amount;
        } else if (transaction.category === "want") {
          want += transaction.amount;
        } else if (transaction.category === "investment") {
          investment += transaction.amount;
        }
      }
    });

    setNeedAmount(need);
    setWantAmount(want);
    setInvestmentAmount(investment);

    if (salary === 0) {
      setNeedSpent(0);
      setWantSpent(0);
      setInvestmentSpent(0);
      return;
    }

    setNeedSpent(Math.round((need / salary) * 100));
    setWantSpent(Math.round((want / salary) * 100));
    setInvestmentSpent(Math.round((investment / salary) * 100));
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
      <div className="bg-gray-700 p-6 rounded-xl flex-1">
        <h3 className="text-xl font-semibold mb-4">🎯 Budget Tracking</h3>
        <fieldset className="fieldset bg-gray-700 w-md p-4 text-lg">
          <div className="flex justify-between mb-1">
            <label className="fieldset-legend">Need</label>
            <label className="fieldset-legend">{needSpent}%</label>
          </div>
          <progress
            className={`progress w-full ${
              needSpent <= 50
                ? "progress-success"
                : needSpent <= 70
                ? "progress-warning"
                : "progress-error"
            }`}
            value={needSpent}
            max="100"
          ></progress>

          <p className="text-sm text-gray-400 label">₹{needAmount} spent</p>

          <div className="flex justify-between mb-1">
            <label className="fieldset-legend">Want</label>
            <label className="fieldset-legend">{wantSpent}%</label>
          </div>
          <progress
            className={`progress w-full ${
              wantSpent <= 50
                ? "progress-success"
                : wantSpent <= 70
                ? "progress-warning"
                : "progress-error"
            }`}
            value={wantSpent}
            max="100"
          ></progress>
          <p className="text-sm text-gray-400 label">₹{wantAmount} spent</p>

          <div className="flex justify-between mb-1">
            <label className="fieldset-legend">Investment</label>
            <label className="fieldset-legend">{investmentSpent}%</label>
          </div>
          <progress
            className={`progress w-full ${
              investmentSpent <= 50
                ? "progress-success"
                : investmentSpent <= 70
                ? "progress-warning"
                : "progress-error"
            }`}
            value={investmentSpent}
            max="100"
          ></progress>
          <p className="text-sm text-gray-400 label">
            ₹{investmentAmount} spent
          </p>
        </fieldset>
      </div>
    </>
  );
};

export default Budget;
