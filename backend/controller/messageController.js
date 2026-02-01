import MessageModel from "../model/messageModel.js";
import { io } from "../server.js";
import ChatModel from "../model/chatModel.js";
import UserModel from "../model/userModel.js";


export const addMessage = async (req, res) => {
  const { chatId, receiverId, text } = req.body;
  const senderId = req.user.id;

  try {
    // 1️⃣ Fetch chat FIRST
    const chat = await ChatModel.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // 2️⃣ BLOCK CHECK (CHAT-LEVEL)
    if (chat.blocked?.blockedBy) {
      return res.status(403).json({ message: "Chat is blocked" });
    }

    // 3️⃣ Fetch sender & receiver (safety)
    const [sender, receiver] = await Promise.all([
      UserModel.findById(senderId),
      UserModel.findById(receiverId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️⃣ Save message
    const message = new MessageModel({
      chatId,
      senderId,
      text,
    });

    const result = await message.save();

    // 5️⃣ Restore chat if receiver deleted it earlier
    await ChatModel.findByIdAndUpdate(chatId, {
      $pull: { deletedBy: receiverId },
    });

    // 6️⃣ Realtime emit
    const activeUser = io.getActiveUsers().find(
      (u) => u.userId === receiverId
    );

    if (activeUser) {
      io.to(activeUser.socketId).emit("receive-message", result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};


// Get all messages in a chat
export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    const chat = await ChatModel.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // find clear time for this user
    const cleared = chat.clearedAt.find(
      (c) => c.userId.toString() === userId
    );

    let query = { chatId };

    // if user cleared chat, show only newer messages
    if (cleared) {
      query.createdAt = { $gt: cleared.time };
    }

    const messages = await MessageModel.find(query);

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

// Delete a message
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  try {
    const message = await MessageModel.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await message.deleteOne();
    io.emit("message-deleted", messageId);

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const message = await MessageModel.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can edit
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    message.text = text;
    const updatedMessage = await message.save();

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json(error);
  }
};
