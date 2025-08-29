'use client';
import { clearAuth } from '@/redux/actions/authSlice';
import { store } from '@/redux/store';
import axios from 'axios';
import Cookies from 'js-cookie';

export const customAxios = axios.create();

axios.defaults.baseURL = process.env.USER_URL || 'http://localhost:3000/';

axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.request.use(
  function (config) {
    const AUTH_TOKEN = Cookies.get('AccessToken');
    config.headers.Authorization = AUTH_TOKEN ? `Bearer ${AUTH_TOKEN}` : '';
    return config;
  },
  function (error) {
    throw error;
  },
);

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (
      error?.response?.status === 401
    ) {
      store.dispatch(clearAuth());
    }
    return Promise.reject(error);
  },
);

export default axios;
