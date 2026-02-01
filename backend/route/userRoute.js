import express from "express";
import {
  getAllUsers,
  getUser,
  searchUser,
  blockUser,
  unblockUser,
} from "../controller/userController.js";
import authMiddleWare from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", authMiddleWare, searchUser);
router.get("/", authMiddleWare, getAllUsers);
router.get("/:id", authMiddleWare, getUser);
router.put("/block", authMiddleWare, blockUser);
router.put("/unblock", authMiddleWare, unblockUser);
export default router;
