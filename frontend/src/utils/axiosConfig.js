import axios from 'axios';

// Base configuration
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
    config => {
        // Get the token from localStorage
        const token = localStorage.getItem('access');
        if (token) {
            config.headers['Authorization'] = `JWT ${token}`;
        }

        // Add CSRF token if available
        const csrfToken = document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }

        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh');
                
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Try to refresh token
                const response = await axios.post(
                    `${axiosInstance.defaults.baseURL}/auth/jwt/refresh/`,
                    { refresh: refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (response.status === 200) {
                    // Update access token
                    localStorage.setItem('access', response.data.access);
                    
                    // Update authorization header
                    axiosInstance.defaults.headers.common['Authorization'] = 
                        `JWT ${response.data.access}`;
                    originalRequest.headers['Authorization'] = 
                        `JWT ${response.data.access}`;

                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Clear tokens and redirect to login
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;