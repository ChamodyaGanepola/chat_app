import express from 'express'
import { getAllUsers, getUser, searchUser } from '../controller/userController.js'
import authMiddleWare from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/:id',authMiddleWare, getUser);
router.get('/',authMiddleWare, getAllUsers)
router.get("/search",authMiddleWare, searchUser);

export default router