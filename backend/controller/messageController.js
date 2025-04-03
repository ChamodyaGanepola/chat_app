import MessageModel from "../model/messageModel.js";
import { io } from '../../socket/index.js';  // Import Socket.io instance

// Add a message and broadcast it via Socket.io
export const addMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;
  const message = new MessageModel({
    chatId,
    senderId,
    text,
  });

  try {
    // Save the message to the database
    const result = await message.save();
    // Broadcast the new message via Socket.io
    io.emit("receive-message", result); 
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
    res.status(200).json(result);  // Respond with the chat messages
  } catch (error) {
    res.status(500).json(error);  // Respond with error if message fetching fails
  }
};
