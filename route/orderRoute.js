import express from "express";
import {
  createOrder,
  getOrder,
  getAllOrders,
} from "../controller/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Route untuk membuat pesanan
router.post("/add", authMiddleware, createOrder);

// Route untuk mendapatkan pesanan berdasarkan ID
router.get("/:orderId", authMiddleware, getOrder);

// Route untuk mendapatkan semua pesanan
router.get("/", authMiddleware, getAllOrders);

export default router;
