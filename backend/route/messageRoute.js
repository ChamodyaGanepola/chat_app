import express from 'express';
import { addMessage, getMessages, markMessagesAsRead  } from '../controller/messageController.js';

const router = express.Router();

router.post('/', addMessage);
router.get('/:chatId', getMessages);
router.put('/:chatId/:userId', markMessagesAsRead);
export default router