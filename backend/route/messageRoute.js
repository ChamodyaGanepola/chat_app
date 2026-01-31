import express from "express";
import {
  addMessage,
  getMessages,
  markMessagesAsRead,
  deleteMessage,
  editMessage,
} from "../controller/messageController.js";
import authMiddleWare from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/", authMiddleWare, addMessage);
router.get("/:chatId", authMiddleWare, getMessages);
router.put("/:chatId/read", authMiddleWare, markMessagesAsRead);
router.delete("/:messageId", authMiddleWare, deleteMessage);
router.put("/edit/:messageId", authMiddleWare, editMessage);
export default router;
