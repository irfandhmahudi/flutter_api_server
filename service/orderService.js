import Order from "../models/orderModel.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import User from "../models/userModels.js";

export const createOrder = async (orderData) => {
  try {
    // Membuat order baru
    const order = new Order(orderData);
    await order.save();
    return order;
  } catch (error) {
    throw new Error("Error creating order: " + error.message);
  }
};

export const getOrderById = async (orderId) => {
  try {
    // Menggunakan populate langsung di query
    const order = await Order.findById(orderId).populate(
      "cart.productId", // Populasi data produk dari productId
      "name price size images" // Ambil field tertentu saja
    );
    return order;
  } catch (error) {
    throw new Error("Error fetching order: " + error.message);
  }
};

export const getAllOrders = async () => {
  try {
    const orders = await Order.find({});
    return orders;
  } catch (error) {
    throw new Error("Error fetching orders: " + error.message);
  }
};

// Fungsi untuk mengupload bukti pembayaran dan memperbarui status
export const uploadPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validasi orderId
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Validasi file bukti pembayaran
    if (!req.file) {
      return res.status(400).json({ message: "Payment proof is required" });
    }

    // Lakukan update order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentProof: req.file.path,
        paymentStatus: "waiting",
      },
      { new: true }
    );

    // Validasi apakah order ditemukan
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Payment proof uploaded successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error uploading payment proof: " + error.message });
  }
};

export const verifyPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    // Validasi paymentStatus
    if (!["approved", "rejected"].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    // Update status pembayaran
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus,
        status_pembayaran: paymentStatus === "approved" ? "paid" : "unpaid",
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Pastikan user ada
    const user = req.user || (await User.findById(updatedOrder.userId)); // Ambil dari req.user atau database
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kirim notifikasi
    const message =
      paymentStatus === "approved"
        ? `Your payment has been approved. Order ID: ${updatedOrder._id}`
        : `Your payment has been rejected. Order ID: ${updatedOrder._id}`;

    triggerNotification(user._id, message, "payment");

    res.status(200).json({
      message: "Payment status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
