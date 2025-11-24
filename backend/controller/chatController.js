import ChatModel from "../model/chatModel.js";
import { io } from '../server.js'

// ---------------------- Create a new chat ----------------------
export const createChat = async (req, res) => {
  const newChat = new ChatModel({
    members: [req.body.senderId, req.body.receiverId],
  });
  try {
    const result = await newChat.save();
    // Broadcast the new message via Socket.io
    io.emit("create-chat", result); 
    // Respond to the HTTP request with the saved chat
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// ---------------------- Get all chats for a user ----------------------
export const userChats = async (req, res) => {
  try {
    const chat = await ChatModel.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};

// ---------------------- Find a chat between two users ----------------------
export const findChat = async (req, res) => {
  try {
    const chat = await ChatModel.findOne({
      members: { $all: [req.params.firstId, req.params.secondId] },
    });
    res.status(200).json(chat)
  } catch (error) {
    res.status(500).json(error)
  }
};