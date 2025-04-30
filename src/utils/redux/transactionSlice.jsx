import { createSlice } from "@reduxjs/toolkit";
const transactionSlice = createSlice({
  name: "transaction",
  initialState: {
    transactions: [],
  },
  reducers: {
    addTransaction: (state, action) => {
      state.transactions = action.payload;
    },
    removeTransaction: (state, action) => {
      state.transactions = state.transactions.filter(
        (transaction) => transaction.id !== action.payload.id
      );
    },
    updateTransaction: (state, action) => {
      const index = state.transactions.findIndex(
        (transaction) => transaction.id === action.payload.id
      );
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
  },
});
export const { addTransaction, removeTransaction, updateTransaction } =
  transactionSlice.actions;
export default transactionSlice.reducer;
