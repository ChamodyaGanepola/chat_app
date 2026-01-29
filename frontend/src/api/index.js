import axios from "axios";

// Base URL for backend API
const API = axios.create({ baseURL: 'http://localhost:5000/' });

// Interceptor to attach JWT token from sessionStorage
API.interceptors.request.use((req) => {
    if (sessionStorage.getItem('profile')) {
        // Parse the stored profile and attach the token in Authorization header
        req.headers.Authorization = `Bearer ${JSON.parse(sessionStorage.getItem('profile')).token}`;
    }
    return req;
});

export default API;

