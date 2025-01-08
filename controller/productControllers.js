import Product from "../models/productModels.js";
import cloudinary from "../config/cloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const { name, price, SKU, stock, category, description, size, discount } =
      req.body;

    // Validation
    if (
      !name ||
      !price ||
      !stock ||
      !category ||
      !SKU ||
      !size ||
      !description ||
      !discount
    ) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    // discount validation
    if (discount && (discount < 0 || discount > 100)) {
      return res
        .status(400)
        .json({ success: false, error: "Discount must be between 0 and 100" });
    }

    // Konversi size ke array jika diberikan sebagai string
    const sizeArray = Array.isArray(size)
      ? size
      : typeof size === "string"
      ? size.split(",").map((s) => s.trim())
      : [];

    // Map file untuk mendapatkan URL dan ID dari Cloudinary dengan nama asli
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        // Mengunggah file ke Cloudinary dengan nama asli

        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "uploads/products", // Folder tujuan di Cloudinary
          public_id: file.originalname.split(".")[0], // Nama file tanpa ekstensi
          resource_type: "image", // Tipe file
          overwrite: true,
        });

        return {
          url: uploaded.secure_url, // URL gambar dari Cloudinary
          originalName: file.originalname,
          publicId: uploaded.public_id,
        };
      })
    );

    const product = new Product({
      name,
      price,
      SKU,
      stock,
      category,

      description,
      images: imageUrls,
      size: sizeArray,
      discount,
    });

    await product.save();

    res
      .status(201)
      .json({ success: true, message: "Product created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    // Mengambil semua produk tanpa filter
    const products = await Product.find();

    // Format harga dan hitung total setelah diskon
    const formattedProducts = products.map(async (product) => {
      const price = product.price; // Harga sebelum diskon
      const discount = product.discount || 0; // Diskon (jika ada)

      // Menghitung harga setelah diskon
      const priceAfterDiscount = price - price * (discount / 100);

      // Format harga dan harga setelah diskon menjadi Rupiah tanpa desimal
      const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0, // Menghilangkan bagian desimal
        maximumFractionDigits: 0, // Menghilangkan bagian desimal
      }).format(price);

      const formattedPriceAfterDiscount = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0, // Menghilangkan bagian desimal
        maximumFractionDigits: 0, // Menghilangkan bagian desimal
      }).format(priceAfterDiscount);

      // Menyimpan harga setelah diskon ke dalam database
      await Product.findByIdAndUpdate(product._id, { priceAfterDiscount });

      // Mengembalikan objek produk dengan harga yang telah diformat
      return {
        ...product.toObject(),
        price: formattedPrice,
        priceAfterDiscount: formattedPriceAfterDiscount,
      };
    });

    // Tunggu semua operasi selesai
    const finalProducts = await Promise.all(formattedProducts);

    // Mengirimkan respon dengan data produk yang telah diformat
    res.status(200).json({ success: true, data: finalProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const price = product.price; // Harga sebelum diskon
    const discount = product.discount || 0; // Diskon (jika ada)

    // Menghitung harga setelah diskon
    const priceAfterDiscount = price - price * (discount / 100);

    // Format harga dan harga setelah diskon menjadi Rupiah tanpa desimal
    const formattedPrice = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0, // Menghilangkan bagian desimal
      maximumFractionDigits: 0, // Menghilangkan bagian desimal
    }).format(price);

    const formattedPriceAfterDiscount = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0, // Menghilangkan bagian desimal
      maximumFractionDigits: 0, // Menghilangkan bagian desimal
    }).format(priceAfterDiscount);

    // Mengembalikan objek produk dengan harga yang telah diformat
    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        price: formattedPrice,
        priceAfterDiscount: formattedPriceAfterDiscount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const { name, price, SKU, stock, category, description, size, discount } =
      req.body;

    if (discount && (discount < 0 || discount > 100)) {
      return res
        .status(400)
        .json({ success: false, error: "Discount must be between 0 and 100" });
    }

    // Hanya update field yang ada di request body
    if (name) product.name = name;
    if (price) product.price = price;
    if (SKU) product.SKU = SKU;
    if (size) product.size = size;
    if (stock) product.stock = stock;
    if (category) product.category = category;
    if (description) product.description = description;
    if (discount) product.discount = discount;
    if (size) product.size = size;

    // Konversi size ke array jika diberikan sebagai string
    // product.size = JSON.parse(size);

    // Cek dan upload gambar jika ada
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(async (file) => {
          // Mengunggah file ke Cloudinary dengan nama asli
          const uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "uploads/products", // Folder tujuan di Cloudinary
            public_id: file.originalname.split(".")[0], // Nama file tanpa ekstensi
            resource_type: "image", // Tipe file
            overwrite: true,
          });

          return {
            url: uploaded.secure_url, // URL gambar dari Cloudinary
            originalName: file.originalname,
            publicId: uploaded.public_id,
          };
        })
      );

      if (imageUrls.length > 0) product.images = imageUrls;
    }

    await product.save();

    res
      .status(200)
      .json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    await product.remove();
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
