import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addSpending, clearSpending } from "../utils/redux/budgetSlice";

const Budget = () => {
  const dispatch = useDispatch();
  const budgets = useSelector((state) => state.budget.budgets);
  const salary = useSelector((state) => state.budget.salary);
  const transactions = useSelector((state) => state.transaction.transactions);
  const user = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (!user) return;

    let need = 0,
      want = 0,
      investment = 0;
    transactions.forEach((t) => {
      if (t.category === "need") need += t.amount;
      else if (t.category === "want") want += t.amount;
      else if (t.category === "investment") investment += t.amount;
    });

    dispatch(clearSpending());
    dispatch(addSpending({ category: "need", amount: need }));
    dispatch(addSpending({ category: "want", amount: want }));
    dispatch(addSpending({ category: "investment", amount: investment }));
  }, [transactions]);

  if (budgets.length === 0) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg shadow-md flex-1 text-center">
        <p>No budgets set yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md h-1/2 flex-1">
      <h3 className="text-xl font-semibold mb-4">🎯 Budget Tracking</h3>
      {budgets.map((b) => {
        // const totalBudgetAmount = (b.budget * salary) / 100;
        // const percentage = totalBudgetAmount ? (b.spent / salary) * 100 : 0;
        const percentage = (b.spent / salary) * 100;
        // const totalBudgetAmount = b.budget;

        return (
          <div key={b.id} className="mb-4">
            <div className="flex justify-between mb-1">
              <p>{b.category.toUpperCase()}</p>
              <p>{Math.round(percentage)}%</p>
            </div>
            <div className="w-full bg-gray-600 h-2 rounded-full">
              <div
                className={`h-2 rounded-full ${
                  percentage > 80 ? "bg-red-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400">₹{b.spent} spent</p>
          </div>
        );
      })}
    </div>
  );
};

export default Budget;
