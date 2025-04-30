import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  salary: 0,
  budgets: [
    { id: 1, category: "need", budget: 0, spent: 0 },
    { id: 2, category: "want", budget: 0, spent: 0 },
    { id: 3, category: "investment", budget: 0, spent: 0 },
  ],
};

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    setSalary: (state, action) => {
      state.salary = action.payload;
    },
    setBudget: (state, action) => {
      const { need, want, investment } = action.payload;
      state.budgets = state.budgets.map((b) => {
        if (b.category === "need") return { ...b, budget: need };
        if (b.category === "want") return { ...b, budget: want };
        if (b.category === "investment") return { ...b, budget: investment };
        return b;
      });
    },
    addSpending: (state, action) => {
      const { category, amount } = action.payload;
      const existingBudget = state.budgets.find((b) => b.category === category);
      if (existingBudget) {
        existingBudget.spent += amount; // ✅ Add, not overwrite
      }
    },
    clearSpending: (state) => {
      state.budgets.forEach((b) => {
        b.spent = 0;
      });
    },
  },
});

export const { setBudget, addSpending, setSalary, clearSpending } =
  budgetSlice.actions;

export default budgetSlice.reducer;
