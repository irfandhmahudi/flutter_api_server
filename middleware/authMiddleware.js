import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Periksa apakah header Authorization ada
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  // Format header: "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. Invalid token format." });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Tambahkan data user ke request
    next(); // Lanjut ke middleware berikutnya
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

export default authMiddleware;
