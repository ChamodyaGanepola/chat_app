import MessageModel from "../model/messageModel.js";
import { io } from '../server.js'

// Add a chat message and broadcast it via Socket.io
export const addMessage = async (req, res) => {
  const { chatId, senderId,receiverId, text } = req.body;
  const message = new MessageModel({
    chatId,
    senderId,
    text
    
  });

  try {
    // Save the message to the database
    const result = await message.save(); 
    // Broadcast in real-time only if receiver is online
    // Check if receiver is online and send real-time message
    const activeUser = io.getActiveUsers().find(u => u.userId === receiverId);
    if (activeUser) {
      io.to(activeUser.socketId).emit("receive-message", message);
    }
    res.status(200).json(result);  // Respond with the saved message
  } catch (error) {
    res.status(500).json(error);  // Respond with error if message saving fails
  }
};

// Get all messages for a specific chat
export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const result = await MessageModel.find({ chatId });
    console.log(result);
    res.status(200).json(result);  // Respond with the chat messages
  } catch (error) {
    res.status(500).json(error);  // Respond with error if message fetching fails
  }
};

// Mark all unread messages in a chat as read for the receiver
export const markMessagesAsRead = async (req, res) => {
  const { chatId, userId } = req.params;

  try {
    // Only mark messages as read if they are not sent by the current user
    const result = await MessageModel.updateMany(
      { chatId, senderId: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ updatedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json(error);
  }
};

