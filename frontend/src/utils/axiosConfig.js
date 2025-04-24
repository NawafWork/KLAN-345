import axios from 'axios';
// Update the baseURL to include the full URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Configure CSRF settings
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

// Add request interceptor
axios.interceptors.request.use(
    config => {
        // Ensure auth endpoints are properly formatted
        if (config.url?.includes('auth/jwt')) {
            config.url = `/auth/jwt/${config.url.split('auth/jwt/')[1] || ''}`;
        }
        
        // Add JWT token if available
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `JWT ${token}`;
        }

        // Ensure URL doesn't contain undefined
        config.url = config.url?.replace('/undefined/', '/');
        
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor for token refresh
axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                const res = await axios.post('/auth/jwt/refresh/', {
                    refresh: refreshToken
                });
                
                if (res.status === 200) {
                    localStorage.setItem('access', res.data.access);
                    originalRequest.headers.Authorization = `JWT ${res.data.access}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axios;