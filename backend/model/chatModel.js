import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    ],

    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],

    // when a user cleared/deleted the chat
    clearedAt: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
        time: {
          type: Date,
        },
      },
    ],
  blocked: {
      blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: null,
      },
      blockedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: null,
      },
    },
  },

  { timestamps: true }
);

// Create the Chat model
const ChatModel = mongoose.model("Chat", ChatSchema);
export default ChatModel;
