import axios from 'axios';

// Create a custom axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000', // Replace with your API base URL
  withCredentials: true, // Always send cookies (JWT)
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
