// src/utils/axiosConfig.js
import axios from 'axios';

// Set default baseURL
axios.defaults.baseURL = 'http://localhost:8000';

// Add a request interceptor to add JWT token
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `JWT ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh
axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // If the error is 401 and hasn't already been retried
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token
                const refreshToken = localStorage.getItem('refresh');
                if (!refreshToken) {
                    // No refresh token, logout
                    return Promise.reject(error);
                }
                
                const res = await axios.post('/auth/jwt/refresh/', {
                    refresh: refreshToken
                });
                
                if (res.status === 200) {
                    // Save the new token
                    localStorage.setItem('access', res.data.access);
                    
                    // Update the original request with the new token
                    originalRequest.headers.Authorization = `JWT ${res.data.access}`;
                    
                    // Retry the original request
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, logout the user
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                // Redirect to login page or dispatch logout action
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default axios;