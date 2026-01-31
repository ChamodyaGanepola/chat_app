import ChatModel from "../model/chatModel.js";
import MessageModel from "../model/messageModel.js";
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
    // Get all chats where user is a member
    const chats = await ChatModel.find({ members: userId });

    const filteredChats = [];

    for (const chat of chats) {
      // Find the deletion record for this user (if any)
      const clearedRecord = chat.clearedAt.find(
        (c) => c.userId.toString() === userId
      );

      if (!clearedRecord) {
        // User never deleted -> include chat
        filteredChats.push(chat);
      } else {
        // User deleted at some point -> check if there are messages after that
        const lastMessage = await MessageModel.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .limit(1);

        if (lastMessage && lastMessage.createdAt > clearedRecord.time) {
          filteredChats.push(chat); // there are new messages after delete
        }
        // else: no new messages -> exclude
      }
    }

    res.status(200).json(filteredChats);
  } catch (error) {
    console.error(error);
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



export const deleteChatForMe = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    const chat = await ChatModel.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // mark chat as deleted for user
    if (!chat.deletedBy.includes(userId)) {
      chat.deletedBy.push(userId);
    }

    // store clear time
    const existing = chat.clearedAt.find(
      (c) => c.userId.toString() === userId
    );

    if (existing) {
      existing.time = new Date();
    } else {
      chat.clearedAt.push({
        userId,
        time: new Date(),
      });
    }

    await chat.save();

    res.status(200).json({ message: "Chat cleared for you" });
  } catch (error) {
    res.status(500).json(error);
  }
};
