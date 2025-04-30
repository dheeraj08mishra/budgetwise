import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBudget } from "../utils/redux/budgetSlice";
import { useNavigate } from "react-router-dom";

const BudgetForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const needRef = useRef();
  const wantRef = useRef();
  const investmentRef = useRef();

  const budgets = useSelector((state) => state.budget.budgets);

  const getBudget = (category) =>
    budgets.find((b) => b.category === category)?.budget || 0;

  const handleSave = () => {
    const need = Number(needRef.current.value);
    const want = Number(wantRef.current.value);
    const investment = Number(investmentRef.current.value);
    const total = need + want + investment;

    if (total !== 100) {
      alert("Total must be 100%");
      return;
    }

    dispatch(setBudget({ need, want, investment }));
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="p-4 bg-gray-800 text-white rounded-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Set Budget</h2>

        <div className="mb-2">
          <label>Need (%)</label>
          <input
            type="number"
            ref={needRef}
            defaultValue={getBudget("need")}
            className="w-full p-2 rounded bg-gray-700 mt-1"
          />
        </div>

        <div className="mb-2">
          <label>Want (%)</label>
          <input
            type="number"
            ref={wantRef}
            defaultValue={getBudget("want")}
            className="w-full p-2 rounded bg-gray-700 mt-1"
          />
        </div>

        <div className="mb-2">
          <label>Investment/Saving (%)</label>
          <input
            type="number"
            ref={investmentRef}
            defaultValue={getBudget("investment")}
            className="w-full p-2 rounded bg-gray-700 mt-1"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-4 py-2 rounded font-bold bg-green-500 hover:bg-green-600 transition duration-200"
        >
          Save Budget
        </button>
      </div>
    </div>
  );
};

export default BudgetForm;
