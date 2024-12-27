import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";

// Import routes
import userRoutes from "./route/userRoute.js";
import avatarRoutes from "./route/avatarRoute.js";
import productRoutes from "./route/productRoute.js";

dotenv.config();
connectDB();

const app = express();
app.use(cookieParser());

// Middleware untuk parsing body JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "https://flutter-ui-eight.vercel.app", // URL frontend Anda
    credentials: true, // Ini memungkinkan cookies dikirim bersama permintaan
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(cors(corsOptions));

// Route for users
app.use("/api/user", userRoutes);

// Route for avatars
app.use("/api/avatar", avatarRoutes);

// Route for products
app.use("/api/product", productRoutes);

const PORT = process.env.PORT || 5000;
const HOST = "192.168.1.5";

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
