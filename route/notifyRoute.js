// routes/notificationRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"; // Middleware untuk melindungi route
import {
  getNotifications,
  deleteNotification,
  markAsRead,
} from "../controller/notifyController.js"; // Controller untuk mendapatkan notifikasi

const router = express.Router();

// Route untuk mendapatkan notifikasi
router.get("/", authMiddleware, getNotifications);
// Route untuk menghapus notifikasi berdasarkan ID
router.delete("/:id", authMiddleware, deleteNotification);
// Rute untuk menandai notifikasi sebagai 'read'
router.put("/:id/read", authMiddleware, markAsRead);

export default router;
