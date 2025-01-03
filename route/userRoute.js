import express from "express";
import {
  registerUser,
  loginUser,
  loginAdmin,
  getMe,
  getAllUsers,
  logoutUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
} from "../controller/userControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Login Admin
router.post("/login-admin", loginAdmin);

// Get current user
router.get("/me", authMiddleware, getMe);

// Get all users
router.get("/all", getAllUsers);

// Logout
router.post("/logout", logoutUser);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Resend OTP
router.post("/resend-otp", resendOtp);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.post("/reset-password/:resetToken", resetPassword);

// Update Profile By ID
router.patch("/update-profile", authMiddleware, updateProfile);

// Change Password
router.patch("/change-password", authMiddleware, changePassword);

export default router;
