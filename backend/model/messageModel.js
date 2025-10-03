import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true
    },
    senderId: {
     type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true
    },
  
    text: {
      type: String, required: true
    },
     read: { 
      type: Boolean, 
      default: false 
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model("Message", MessageSchema);
export default MessageModel