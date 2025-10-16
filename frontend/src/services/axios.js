import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === 'production' 
        ? 'https://clinictrack-backend-production.up.railway.app'
        : 'http://127.0.0.1:8000',
    withCredentials: false,  
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor - Add token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login'; // Redirect to login
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;