import axios from 'axios'

const API = axios.create({ baseURL: 'https://chat-app-kali.onrender.com' });

export const getMessages = (id) => API.get(`/message/${id}`);

export const addMessage = (data) => API.post('/message/', data);

export const readMessage = (chatId, userId) => API.put(`/message/${chatId}/${userId}`);