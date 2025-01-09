// utils/notificationUtils.js
import Notification from "../models/notifyModel.js"; // Model untuk menyimpan notifikasi

export const triggerNotification = async (userId, message, category) => {
  try {
    // Membuat notifikasi dan menyimpannya ke database
    const newNotification = new Notification({
      userId,
      message,
      category,
      read: false, // Notifikasi ini belum dibaca
      createdAt: new Date(),
    });

    await newNotification.save();
    console.log(`Notification sent to user ${userId}: ${message}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
