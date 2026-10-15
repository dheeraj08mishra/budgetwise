import { createSlice } from "@reduxjs/toolkit";
const transactionSlice = createSlice({
  name: "transaction",
  initialState: {
    transactions: [],
    recurringTransactions: [],
    totalTransactions: 0,
  },
  reducers: {
    addTransaction: (state, action) => {
      state.transactions = action.payload;
    },
    addRecurringTransaction: (state, action) => {
      state.recurringTransactions = action.payload;
    },
    // "Load more": add the next page, skipping rows already shown (a row
    // added elsewhere in the meantime shifts positions by one)
    appendTransactions: (state, action) => {
      const seen = new Set(state.transactions.map((t) => t._id));
      state.transactions.push(
        ...action.payload.filter((t) => !seen.has(t._id))
      );
    },
    removeTransaction: (state, action) => {
      state.transactions = state.transactions.filter(
        (transaction) => transaction._id !== action.payload._id
      );
    },
    updateTransaction: (state, action) => {
      const index = state.transactions.findIndex(
        (transaction) => transaction._id === action.payload._id
      );
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    setTotalTransactions: (state, action) => {
      state.totalTransactions = action.payload;
    },
    removeAllTransactions: (state) => {
      state.transactions = [];
      state.totalTransactions = 0;
    },
  },
});
export const {
  addTransaction,
  removeTransaction,
  updateTransaction,
  setTotalTransactions,
  removeAllTransactions,
  addRecurringTransaction,
  appendTransactions,
} = transactionSlice.actions;
export default transactionSlice.reducer;
