import { createSlice } from "@reduxjs/toolkit";
const transactionSlice = createSlice({
  name: "transaction",
  initialState: {
    transactions: [],
    totalTransactions: 0,
  },
  reducers: {
    addTransaction: (state, action) => {
      state.transactions = action.payload;
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
  },
});
export const {
  addTransaction,
  removeTransaction,
  updateTransaction,
  setTotalTransactions,
} = transactionSlice.actions;
export default transactionSlice.reducer;
