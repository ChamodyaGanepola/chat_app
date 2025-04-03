import express from 'express'
import { getAllUsers, getUser, searchUser } from '../controller/userController.js'
import authMiddleWare from '../middleware/authMiddleware.js'



const router = express.Router()

router.get('/:id', getUser);
router.get('/',getAllUsers)
router.get("/search", searchUser);



export default router