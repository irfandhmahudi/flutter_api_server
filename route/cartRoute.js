import express from "express";
import {
  addCart,
  getCartProducts,
  removeCart,
  updateCartProductQuantity,
  // Import fungsi checkoutCart
} from "../controller/cartController.js";
import authMiddleware from "../middleware/authMiddleware.js"; // Middleware untuk melindungi route

const router = express.Router();

// Route untuk menambahkan item ke keranjang
router.post("/add", authMiddleware, addCart);

// Route untuk menghapus item dalam keranjang
router.delete("/remove", authMiddleware, removeCart);

// Route untuk mendapatkan semua produk di keranjang
router.get("/products", authMiddleware, getCartProducts);

// Route untuk update quantity produk di keranjang
router.patch("/update-quantity", authMiddleware, updateCartProductQuantity);

export default router;
