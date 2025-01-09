import express from "express";
import {
  addCart,
  removeAllCart,
  getCartProducts,
  removeCart,
  updateCartProductQuantity,
  decreaseCartProductQuantity,
} from "../controller/cartController.js";
import authMiddleware from "../middleware/authMiddleware.js"; // Middleware untuk melindungi route

const router = express.Router();

// Route untuk menambahkan item ke keranjang
router.post("/add", authMiddleware, addCart);

// Route untuk menghapus semua item dalam keranjang
router.delete("/remove-all", authMiddleware, removeAllCart);

// Route untuk menghapus item dalam keranjang
router.delete("/remove", authMiddleware, removeCart);

// Route untuk mendapatkan semua produk di keranjang
router.get("/products", authMiddleware, getCartProducts);

// Route untuk update quantity produk di keranjang
router.post("/update-quantity", authMiddleware, updateCartProductQuantity);

// Route untuk decrease quantity produk di keranjang
router.post("/decrease-quantity", authMiddleware, decreaseCartProductQuantity);

export default router;
