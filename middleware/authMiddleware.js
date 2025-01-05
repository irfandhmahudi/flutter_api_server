import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Prioritaskan token dari header Authorization
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]; // Ambil token setelah "Bearer"
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided, unauthorized" });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ambil user berdasarkan ID yang di-decode dari token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Simpan informasi user ke request object
    req.user = user;

    // Lanjutkan ke middleware berikutnya atau route handler
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

export default authMiddleware;
