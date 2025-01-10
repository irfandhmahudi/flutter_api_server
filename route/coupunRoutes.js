import express from "express";
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  applyCoupon,
} from "../controller/coupunController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.get("/", authMiddleware, getCoupons); // GET all coupons
router.post("/", authMiddleware, createCoupon); // POST create a new coupon
router.delete("/:id", authMiddleware, deleteCoupon); // DELETE a coupon by ID
router.post("/apply", authMiddleware, applyCoupon); // POST apply a coupon

export default router;
