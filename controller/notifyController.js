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

// Menghapus notifikasi berdasarkan ID
export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id; // Mendapatkan ID notifikasi dari parameter URL

    // Cari dan hapus notifikasi berdasarkan ID
    const deletedNotification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: req.user.id, // Memastikan notifikasi milik user yang sedang login
    });

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or not authorized to delete",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Ubah status 'read' notifikasi
export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id; // Mendapatkan ID notifikasi dari parameter URL

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true }, // Mengubah status 'read' menjadi true
      { new: true } // Mengembalikan notifikasi yang sudah diperbarui
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
