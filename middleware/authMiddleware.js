import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

const authMiddleware = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(401).json({ success: false, message: "Unauthorized" }); // Kirim respon 401 (Unauthorized)
    }
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" }); // Kirim respon 401 (Unauthorized)
  }
};

export default authMiddleware;
