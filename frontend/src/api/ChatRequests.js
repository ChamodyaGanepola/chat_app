import API from "./index.js";

// Create chat
export const createChat = (data) => API.post("/chat", data);

// Get logged-in user's chats
export const userChats = () => API.get("/chat");

// Find chat between users
export const findChat = (secondId) =>
  API.get(`/chat/find/${secondId}`);
