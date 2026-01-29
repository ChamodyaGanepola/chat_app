import express from "express";
import {
  getAllUsers,
  getUser,
  searchUser,
} from "../controller/userController.js";
import authMiddleWare from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", authMiddleWare, searchUser);
router.get("/", authMiddleWare, getAllUsers);
router.get("/:id", authMiddleWare, getUser);

export default router;
