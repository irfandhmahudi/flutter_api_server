import * as OrderService from "../service/orderService.js";
import { triggerNotification } from "../utils/notifyHelper.js";
import User from "../models/userModels.js";

// Controller untuk membuat pesanan
export const createOrder = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  try {
    const {
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

    // Perbarui stok produk berdasarkan cart
    for (const item of user.cart) {
      await OrderService.updateProductStock(item.productId, item.quantity);
    }

    // Kosongkan keranjang belanja
    user.cart = [];
    await user.save();

    // Kirimkan notifikasi ke user
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
