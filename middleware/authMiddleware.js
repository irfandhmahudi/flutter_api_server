import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari cookie
    const token = req.cookies?.auth_token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cari user berdasarkan ID dari payload token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Tambahkan informasi user ke req untuk akses di route berikutnya
    req.user = user;

    // Lanjutkan ke middleware atau route handler berikutnya
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default authMiddleware;
