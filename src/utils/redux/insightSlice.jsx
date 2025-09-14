import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  insights: [],
  anomalies: [],
};

const insightSlice = createSlice({
  name: "insight",
  initialState,
  reducers: {
    setInsights: (state, action) => {
      state.insights = action.payload;
    },
    setAnomalies: (state, action) => {
      state.anomalies = action.payload;
    },
  },
});

export const { setInsights, setAnomalies } = insightSlice.actions;

export default insightSlice.reducer;
