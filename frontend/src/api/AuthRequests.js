import API from "./index.js";

export const logIn = (formData) =>
  API.post("/auth/login", formData);

export const signUp = (formData) =>
  API.post("/auth/register", formData);
