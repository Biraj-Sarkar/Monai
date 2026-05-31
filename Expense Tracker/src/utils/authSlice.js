import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: {},
  userToken: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token")
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSucess: (state, action) => {
      state.userInfo = action.payload.userInfo;
      state.userToken = action.payload.userToken;
      state.isAuthenticated = true;

      localStorage.setItem("token", action.payload.userToken);
    },
    logout: (state, action) => {
      state.userInfo = {};
      state.userToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
    }
  }
});

export const { loginSucess, logout } = authSlice.actions;
export default authSlice.reducer;