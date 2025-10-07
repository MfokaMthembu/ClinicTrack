import axios from "axios";

// Create Axios instance for Laravel backend
const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000", 
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});


export default axiosInstance;
