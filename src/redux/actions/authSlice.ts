'use client';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
export interface AuthState {
  name?: string;
  role?: string[];
  organization?: string;
  group?: string;
  isLogged?: boolean;
}

const initialState: AuthState = {
  name: '',
  role: [],
  organization: '',
  group: '',
  isLogged: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAuth: (state, action: PayloadAction<AuthState>) => {
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.organization = action.payload.organization;
      state.group = action.payload.group;
      state.isLogged = action.payload.isLogged;
    },
    clearAuth: (state) => {
      // localStorage.clear();
      Cookies.remove('AccessToken');
      Cookies.remove('RefreshToken'); 
      state.name = '';
      state.role = [];
      state.organization = '';
      state.group = '';
      state.isLogged = false;
    },
  },
});
export const {
  updateAuth,
  clearAuth,
} = authSlice.actions;
export default authSlice.reducer;
