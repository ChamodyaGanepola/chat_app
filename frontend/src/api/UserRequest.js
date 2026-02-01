import API from "./index.js";

export const getUser = (userId) => API.get(`/user/${userId}`);

export const getAllUser = () => API.get('/user')

export const searchUsers = (value) => API.get(`/user/search?q=${value}`);

export const blockUser = (targetUserId) =>
    API.put("/user/block", { targetUserId });


export const unblockUser = (targetUserId) =>
    API.put("/user/unblock", { targetUserId });