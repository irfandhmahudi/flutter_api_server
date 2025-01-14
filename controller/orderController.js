import * as OrderService from "../service/orderService.js";
import { triggerNotification } from "../utils/notifyHelper.js";
import User from "../models/userModels.js";

// Controller untuk membuat pesanan
export const createOrder = async (req, res) => {
  try {
    const {
      // userId,
      cart,
      total,
      discount,
      origin,
      destination,
      weight,
      courier,
      service,
      shipping_cost,
    } = req.body;

    const orderData = {
      // userId,
      origin,
      destination,
      weight,
      courier,
      service,
      shipping_cost,
      total,
      discount,
      cart,
      status_pembayaran: "unpaid", // Default status pembayaran
    };

    // Panggil service untuk membuat order
    const newOrder = await OrderService.createOrder(orderData);

    // Kirimkan notifikasi ke user
    const user = req.user;

    triggerNotification(
      user._id,
      `Your order has been placed successfully. Order ID: ${newOrder._id}`,
      "security"
    );

    // Kirimkan response sukses dengan data order
    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller untuk mendapatkan detail pesanan
export const getOrder = async (req, res) => {
  try {
    // Panggil OrderService.getOrderById untuk mendapatkan detail order
    const order = await OrderService.getOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller untuk mendapatkan semua pesanan
export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validasi apakah file bukti pembayaran ada
    if (!req.file) {
      return res.status(400).json({ message: "Payment proof is required" });
    }

    // Panggil fungsi uploadPaymentProof dari OrderService
    const updatedOrder = await OrderService.uploadPaymentProof(
      orderId,
      req.file
    );

    res.status(200).json({
      message: "Payment proof uploaded successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller untuk admin untuk memverifikasi bukti pembayaran
export const verifyPaymentProof = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body; // 'approved' or 'rejected'

    // Panggil fungsi verifyPaymentProof dari OrderService
    const updatedOrder = await OrderService.verifyPaymentProof(
      orderId,
      paymentStatus
    );

    // Kirimkan notifikasi ke user jika pembayaran disetujui atau ditolak
    const user = await User.findById(updatedOrder.userId); // Asumsi bahwa Order memiliki field userId
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
