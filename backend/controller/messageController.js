import MessageModel from "../model/messageModel.js";
import { io } from "../server.js";

// Add a chat message
export const addMessage = async (req, res) => {
  const { chatId, receiverId, text } = req.body;
  const senderId = req.user.id; // from JWT

  const message = new MessageModel({
    chatId,
    senderId,
    text,
  });

  try {
    const result = await message.save();

    // Send real-time message if receiver is online
    const activeUser = io.getActiveUsers().find(
      (u) => u.userId === receiverId
    );
    if (activeUser) {
      io.to(activeUser.socketId).emit("receive-message", result);
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get all messages in a chat
export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await MessageModel.find({ chatId });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id; // authenticated user

  try {
    const result = await MessageModel.updateMany(
      { chatId, senderId: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ updatedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json(error);
  }
};
