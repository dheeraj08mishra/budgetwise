import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    photoURL: "",
  },
  reducers: {
    updateProfile: (state, action) => {
      const { firstName, lastName, email, phone, address, photoURL } =
        action.payload;
      state.firstName = firstName;
      state.lastName = lastName;
      state.email = email;
      state.phone = phone;
      state.address = address;
      state.photoURL = photoURL;
    },
  },
});
export const { updateProfile } = profileSlice.actions;
export default profileSlice.reducer;
