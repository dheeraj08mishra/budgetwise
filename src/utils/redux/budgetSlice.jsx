import { createSlice } from "@reduxjs/toolkit";

// `salary` = total income of the month shown on the dashboard; budget
// percentages are measured against it.
const initialState = {
  salary: 0,
};

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    setSalary: (state, action) => {
      state.salary = action.payload;
    },
    resetSalary: (state) => {
      state.salary = 0;
    },
  },
});

export const { setSalary, resetSalary } = budgetSlice.actions;

export default budgetSlice.reducer;
