// routes/notificationRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"; // Middleware untuk melindungi route
import { getNotifications } from "../controller/notifyController.js"; // Controller untuk mendapatkan notifikasi

const router = express.Router();

// Route untuk mendapatkan notifikasi
router.get("/", authMiddleware, getNotifications);

export default router;
