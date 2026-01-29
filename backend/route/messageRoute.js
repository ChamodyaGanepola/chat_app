import express from "express";
import {
  addMessage,
  getMessages,
  markMessagesAsRead,
} from "../controller/messageController.js";
import authMiddleWare from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/", authMiddleWare, addMessage);
router.get("/:chatId", authMiddleWare, getMessages);
router.put("/:chatId/read", authMiddleWare, markMessagesAsRead);

export default router;
