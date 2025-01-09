// controllers/notificationController.js
import Notification from "../models/notifyModel.js"; // Model untuk notifikasi

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Menampilkan notifikasi terbaru terlebih dahulu
      .exec();

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
