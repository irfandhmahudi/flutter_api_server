import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "../config/database.js";
import cookieParser from "cookie-parser";

// Import routes
import userRoutes from "../route/userRoute.js";
import avatarRoutes from "../route/avatarRoute.js";
import productRoutes from "../route/productRoute.js";

dotenv.config();
connectDB();

const app = express();
app.use(cookieParser());

// Middleware untuk parsing body JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:3000", // Untuk emulator Android
  "http://10.0.2.2:3000",
  "http://192.168.1.4:3000",
  "http://127.0.0.1:3000",
  "*",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Jika Anda menggunakan cookies atau header khusus
  })
);

// Route for users
app.use("/api/user", userRoutes);

// Route for avatars
app.use("/api/avatar", avatarRoutes);

// Route for products
app.use("/api/product", productRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Menjalankan express sebagai fungsi serverless untuk Vercel
export default (req, res) => {
  app(req, res);
};
