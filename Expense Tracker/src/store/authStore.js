import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../utils/authSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer
  }
});