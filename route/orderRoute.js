import express from "express";
import {
  createOrder,
  getOrder,
  getAllOrders,
  uploadPaymentProof,
  verifyPaymentProof,
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

// Route untuk upload bukti pembayaran
router.post(
  "/:orderId/upload-payment-proof",
  upload.array("paymentProof", 1),
  authMiddleware, // 'paymentProof' adalah field untuk file di form
  uploadPaymentProof
);

// Route untuk admin memverifikasi bukti pembayaran
router.post("/:orderId/verify-payment", authMiddleware, verifyPaymentProof);

export default router;
