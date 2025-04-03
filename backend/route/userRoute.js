import express from 'express'
import { getAllUsers, getUser, updateUser, searchUser } from '../controller/userController.js'
import authMiddleWare from '../middleware/authMiddleware.js'



const router = express.Router()

router.get('/:id', getUser);
router.get('/',getAllUsers)
router.put('/:id',authMiddleWare, updateUser)
router.get("/search", searchUser);



export default router