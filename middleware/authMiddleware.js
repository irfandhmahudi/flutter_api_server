import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

// const authMiddleware = async (req, res, next) => {
//   try {
//     // Prioritaskan token dari header Authorization jika ada
//     const authHeader = req.headers.authorization;
//     let token;

//     if (authHeader && authHeader.startsWith("Bearer ")) {
//       token = authHeader.split(" ")[1]; // Ambil token setelah "Bearer"
//     } else if (req.cookies && req.cookies.token) {
//       token = req.cookies.token; // Ambil token dari cookie
//     }

//     if (!token) {
//       return res
//         .status(401)
//         .json({ success: false, message: "No token provided, unauthorized" });
//     }

//     // Verifikasi token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Ambil user berdasarkan ID yang di-decode dari token
//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     // Simpan informasi user ke request object
//     req.user = user;

//     // Lanjutkan ke middleware berikutnya atau route handler
//     next();
//   } catch (error) {
//     console.error("Error in authMiddleware:", error.message);

//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token",
//       error: error.message,
//     });
//   }
// };
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // Mendapatkan token dari cookie
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided, unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // Ambil user berdasarkan ID dari token

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    req.user = user; // Menyimpan data user di req
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid token", error: error.message });
  }
};

export default authMiddleware;
