import axios from "axios";

const API = axios.create({ baseURL: "https://chat-app-kali.onrender.com" });

API.interceptors.request.use((req) => {
    if (sessionStorage.getItem('profile')) {
      req.headers.Authorization = `Bearer ${JSON.parse(sessionStorage.getItem('profile')).token}`;
    }
  
    return req;
  });

export const getUser = (userId) => API.get(`/user/${userId}`);

export const getAllUser = ()=> API.get('/user')

export const searchUsers = (value) => API.get(`/user/search?q=${value}`);
