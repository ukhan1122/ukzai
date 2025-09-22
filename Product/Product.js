const Product = require("../model/productmodel");

// ✅ Create product with multiple images (Cloudinary URLs)
const Createproduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;

    // Cloudinary returns `file.path` which is the hosted URL
    const images = req.files ? req.files.map((file) => file.path) : [];

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      images,
    });

    await newProduct.save();
    res.status(201).json({
      message: "Product created successfully ✅",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(400).json({
      message: "Error creating product",
      error: error.message,
    });
  }
};

// ✅ Update product with multiple images
const UpdateProduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;

    // If new images are uploaded, replace with Cloudinary URLs; otherwise keep old
    const images = req.files ? req.files.map((file) => file.path) : undefined;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        description,
        stock,
        ...(images && { images }), // only update if new images uploaded
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully ✅",
      product: updated,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};

// ✅ Get all products
const GetAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// ✅ Get product by ID
const GetProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// ✅ Delete product
const DeleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully ✅" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};

module.exports = {
  Createproduct,
  GetAllProducts,
  GetProductById,
  UpdateProduct,
  DeleteProduct,
};
