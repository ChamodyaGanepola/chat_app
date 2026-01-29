import { genSalt } from "bcrypt";
import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    lastLogin: {
      type: Date,      // store the login date and time
      default: null,   // null initially, updated on login
    },
  },
  { timestamps: true } // createdAt and updatedAt
);

const UserModel = mongoose.model("Users", UserSchema);
export default UserModel;
