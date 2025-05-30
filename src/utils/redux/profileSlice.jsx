import { createSlice } from "@reduxjs/toolkit";

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
    },
    logout: (state) => {
      state.currentUser = null;
    },
  },
});
export const { updateProfile, logout } = profileSlice.actions;
export default profileSlice.reducer;
