// src/utils/axiosInstance.ts

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api", // Replace with your API base URL
  timeout: 10000, // Optional: set a timeout
  headers: {
    "Content-Type": "application/json", // Set default headers if needed
  },
});

// Optional: Add an interceptor for requests
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // You can modify the request here, e.g., add an authorization token
//     // const token = localStorage.getItem('token');
//     // if (token) {
//     //   config.headers.Authorization = `Bearer ${token}`;
//     // }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add an interceptor for responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    return Promise.reject(error);
  }
);



export default axiosInstance;

export interface ApiResponse<T> {
  // status: string;
  // statusCode: number;
  // message: string;
  data: T;
  // meta?: {
  //   sortBy: string;
  //   sortOrder: string;
  // };
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}