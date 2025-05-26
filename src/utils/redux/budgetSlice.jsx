import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  salary: 0,
  totalExpenseAmount: 0,
  totalIncomeAmount: 0,
  balance: 0,
};

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    setSalary: (state, action) => {
      state.salary = action.payload;
    },
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setTotalExpenseAmount: (state, action) => {
      state.totalExpenseAmount = action.payload;
    },
    setTotalIncomeAmount: (state, action) => {
      state.totalIncomeAmount = action.payload;
    },
  },
});

export const {
  setSalary,
  setBalance,
  setTotalExpenseAmount,
  setTotalIncomeAmount,
} = budgetSlice.actions;

export default budgetSlice.reducer;
