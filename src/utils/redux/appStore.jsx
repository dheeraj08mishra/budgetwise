import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import transactionReducer from "./transactionSlice";
import budgetReducer from "./budgetSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    transaction: transactionReducer,
    budget: budgetReducer,
  },
});
export default store;
