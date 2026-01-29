import API from "./index.js";
// Get all messages of a chat
export const getMessages = (chatId) =>
  API.get(`/message/${chatId}`);

// Add a new message
export const addMessage = (data) =>
  API.post("/message", data);

// Mark messages as read for a chat
export const readMessage = (chatId) =>
  API.put(`/message/${chatId}/read`);
