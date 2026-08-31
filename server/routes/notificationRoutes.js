import express from "express";
import { getNotifications, markRead } from "../controllers/notificationController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.patch('/read', authMiddleware, markRead);

export default router;
