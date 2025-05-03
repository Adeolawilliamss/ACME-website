import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Create a custom axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  withCredentials: true,
  timeout: 10000,
});

// Configure NProgress
NProgress.configure({ showSpinner: false });

// Request interceptor — show loader on start
axiosInstance.interceptors.request.use(
  config => {
    NProgress.start();
    return config;
  },
  error => {
    NProgress.done();
    return Promise.reject(error);
  }
);

// Response interceptor — stop loader on success or error
axiosInstance.interceptors.response.use(
  response => {
    NProgress.done();
    return response;
  },
  error => {
    NProgress.done();

    if (error.response && error.response.status === 401) {
      // Optional: handle 401 here if you want to globally catch auth errors
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
