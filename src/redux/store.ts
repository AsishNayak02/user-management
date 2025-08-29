'use client';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './actions/authSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
