import mongoose from "mongoose"; //Mongoose library to work with MongoDB

// Define the schema (blueprint) for the Chat collection
const ChatSchema = new mongoose.Schema(
  {
      // 'members' field will store an array of user IDs who are part of this chat
    members: {
      type: Array,
    },
  },
  {
     // Automatically add 'createdAt' and 'updatedAt' timestamps to each document
    timestamps: true,
  }
);

// Create a Mongoose model from the schema
// 'Chat' is the model name of ChatSchema blueprint, Mongoose will create a collection named 'chats' in MongoDB
const ChatModel = mongoose.model("Chat", ChatSchema);
export default ChatModel;