import axios from 'axios';

// Create a custom axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  withCredentials: true,
  timeout: 200000, // ← 2 minutes timeout
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  response => {
    return response; // Allow the response to go through
  },
  error => {
    if (error.response && error.response.status === 401) {
      // The backend returns 401 for unauthenticated requests
      // We'll handle the redirection in the component where useRouter is available
    }
    return Promise.reject(error); // Reject the error to propagate it
  }
);

export default axiosInstance;
