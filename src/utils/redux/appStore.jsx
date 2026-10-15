import { configureStore } from "@reduxjs/toolkit";
import transactionReducer from "./transactionSlice";
import budgetReducer from "./budgetSlice";
import profileReducer from "./profileSlice";
import goalReducer from "./goalSlice";
import insightReducer from "./insightSlice";

const store = configureStore({
  reducer: {
    transaction: transactionReducer,
    insight: insightReducer,
    goal: goalReducer,
    budget: budgetReducer,
    profile: profileReducer,
  },
});
export default store;
