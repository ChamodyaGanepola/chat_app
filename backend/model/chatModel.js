import mongoose from "mongoose";

// Define the schema for the Chat collection
const ChatSchema = new mongoose.Schema(
  {
    // 'members' stores an array of user IDs referencing the Users collection
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    ],
  },
  {
    timestamps: true, 
  }
);

// Create the Chat model
const ChatModel = mongoose.model("Chat", ChatSchema);
export default ChatModel;
