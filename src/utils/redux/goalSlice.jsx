import { createSlice } from "@reduxjs/toolkit";

const goalSlice = createSlice({
  name: "goal",
  initialState: {
    goals: [],
  },
  reducers: {
    setGoals: (state, action) => {
      state.goals = action.payload;
    },
  },
});

export const { setGoals } = goalSlice.actions;
export default goalSlice.reducer;
