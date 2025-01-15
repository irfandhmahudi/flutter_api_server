import User from "../models/userModels.js";
import Product from "../models/productModels.js"; // Asumsi Anda punya model Product

// Menambahkan item ke keranjang
export const addCart = async (req, res) => {
  const { productId, quantity, size } = req.body; // Menambahkan size di body
  if (!size) {
    return res.status(400).json({ message: "Size is required" }); // Validasi size
  }

  try {
    const user = await User.findById(req.user.id); // Mendapatkan user dari token
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cek jika produk sudah ada di keranjang
    const existingProductIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId && item.size === size
    );

    // Ambil data produk untuk mendapatkan harga
    const product = await Product.findById(productId); // Ambil produk berdasarkan productId
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productPrice = product.price; // Harga produk

    if (existingProductIndex !== -1) {
      // Jika produk dan ukuran sudah ada, perbarui jumlahnya dan total harga
      user.cart[existingProductIndex].quantity += quantity;
      user.cart[existingProductIndex].totalPrice =
        productPrice * user.cart[existingProductIndex].quantity; // Perbarui total harga
    } else {
      // Jika produk belum ada, tambahkan produk baru ke keranjang
      user.cart.push({
        productId,
        quantity,
        size,
      });
    }

    await user.save();
    res.status(200).json({ message: "Product added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Menghapus item dalam keranjang
export const removeCart = async (req, res) => {
  try {
    // Mendapatkan user berdasarkan ID
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mendapatkan productId dari request body
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Cari produk di keranjang user dan hapus
    const cartIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (cartIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    user.cart.splice(cartIndex, 1); // Hapus produk dari keranjang

    // Simpan perubahan ke database
    await user.save();

    res.status(200).json({
      message: "Product removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mendapatkan produk dalam keranjang
export const getCartProducts = async (req, res) => {
  try {
    // Mengambil user berdasarkan ID, dan populate cart dengan data produk
    const user = await User.findById(req.user.id)
      .populate("cart.productId", "name price images sizes SKU discount") // Tambahkan 'discount'
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format cart untuk menambahkan informasi gambar, harga, quantity, dan ukuran
    const cartDetails = user.cart.map((item) => {
      const product = item.productId;

      // Memastikan ada gambar yang tersedia dan mengambil gambar pertama
      const productImage =
        product.images && product.images.length > 0
          ? product.images[0].url
          : null;

      // Mendapatkan ukuran yang dipilih oleh user
      const selectedSize = item.size || "N/A"; // "N/A" jika ukuran tidak dipilih

      // Hitung harga satuan setelah diskon produk (jika ada diskon)
      const discountedPrice = product.discount
        ? product.price - (product.price * product.discount) / 100
        : product.price;

      // subtotal
      const subtotal = discountedPrice * item.quantity;

      // Total harga per item setelah diskon
      const itemTotalPrice = discountedPrice * item.quantity;

      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        discount: product.discount || 0, // Persentase diskon produk
        discountedPrice, // Harga satuan setelah diskon
        image: productImage, // Menampilkan gambar pertama
        quantity: item.quantity, // Kuantitas produk dalam cart
        size: selectedSize, // Ukuran yang dipilih oleh user
        SKU: product.SKU,
        itemPrice: itemTotalPrice, // Total harga per item
        subtotal,
      };
    });

    // subtotal
    const subtotal = cartDetails.reduce((acc, item) => acc + item.subtotal, 0);

    // Hitung total keseluruhan harga
    const totalPrice = cartDetails.reduce(
      (acc, item) => acc + item.itemPrice,
      0
    );

    res.status(200).json({
      cart: cartDetails,
      totalPrice, // Total harga keseluruhan
      subtotal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Memperbarui jumlah produk dalam keranjang
export const updateCartProductQuantity = async (req, res) => {
  const { productId, quantity } = req.body;

  // Validasi input
  if (!productId || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: "Product ID dan quantity harus disertakan",
    });
  }

  try {
    // Mendapatkan user berdasarkan ID dari token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    // Cek apakah produk ada dalam keranjang
    const cartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan di keranjang",
      });
    }

    // Jika quantity kurang dari 1, hapus item dari keranjang
    if (quantity < 1) {
      user.cart.splice(cartItemIndex, 1); // Hapus produk dari keranjang
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus dari keranjang",
        cart: user.cart,
      });
    }

    // Ambil data produk untuk memastikan akurasi harga
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan di database",
      });
    }

    // Perbarui quantity dan total harga
    user.cart[cartItemIndex].quantity = quantity;
    user.cart[cartItemIndex].totalPrice = product.price * quantity;

    // Simpan perubahan
    await user.save();

    res.status(200).json({
      success: true,
      message: "Keranjang berhasil diperbarui",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui keranjang",
      error: error.message,
    });
  }
};
