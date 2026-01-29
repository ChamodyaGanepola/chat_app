import ChatModel from "../model/chatModel.js";
import { io } from "../server.js";

// Create a new chat
export const createChat = async (req, res) => {
  const senderId = req.user.id; // authenticated user
  const { receiverId } = req.body;

  const newChat = new ChatModel({
    members: [senderId, receiverId],
  });

  try {
    const result = await newChat.save();
    io.emit("create-chat", result);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Get all chats for logged-in user
export const userChats = async (req, res) => {
  const userId = req.user.id;

  try {
    const chats = await ChatModel.find({
      members: { $in: [userId] },
    });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Find chat between logged-in user and another user
export const findChat = async (req, res) => {
  const firstId = req.user.id;
  const { secondId } = req.params;

  try {
    const chat = await ChatModel.findOne({
      members: { $all: [firstId, secondId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};
