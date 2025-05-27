import { createSlice, current } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    currentUser: null,
  },
  reducers: {
    updateProfile: (state, action) => {
      const user = action.payload;
      state.currentUser = {
        ...state.currentUser,
        ...user,
      };
      // Log the current state for debugging
      console.log("Updated profile:", current(state));
    },
  },
});
export const { updateProfile } = profileSlice.actions;
export default profileSlice.reducer;
