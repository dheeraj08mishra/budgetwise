import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  insights: [],
};

const insightSlice = createSlice({
  name: "insight",
  initialState,
  reducers: {
    setInsights: (state, action) => {
      state.insights = action.payload;
    },
  },
});

export const { setInsights } = insightSlice.actions;

export default insightSlice.reducer;
