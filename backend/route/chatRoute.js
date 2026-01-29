import express from "express";
import {
  createChat,
  findChat,
  userChats,
} from "../controller/chatController.js";
import authMiddleWare from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/", authMiddleWare, createChat);
router.get("/", authMiddleWare, userChats);
router.get("/find/:secondId", authMiddleWare, findChat);

export default router;
