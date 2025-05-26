import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import transactionReducer from "./transactionSlice";
import budgetReducer from "./budgetSlice";
import profileReducer from "./profileSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    transaction: transactionReducer,
    budget: budgetReducer,
    profile: profileReducer,
  },
});
export default store;
