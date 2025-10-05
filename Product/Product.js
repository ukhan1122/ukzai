const Product = require("../model/productmodel");

// Create product with Cloudinary images
const Createproduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;

    console.log("📦 Creating product:", { name, price, stock });
    console.log("🖼️ Files received:", req.files ? req.files.length : 0);

    // CloudinaryStorage gives full URLs in file.path
    const images = req.files ? req.files.map((file) => file.path) : [];

    console.log("✅ Cloudinary Image URLs:", images);

    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      images,
    });

    await newProduct.save();
    
    console.log("✅ Product saved to database with ID:", newProduct._id);
    
    res.status(201).json({
      message: "✅ Product created successfully",
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

// Update product with new Cloudinary images
const UpdateProduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;
    
    console.log("🔄 Updating product:", req.params.id);
    console.log("🖼️ New files received:", req.files ? req.files.length : 0);

    const images = req.files ? req.files.map((file) => file.path) : undefined;

    const updateData = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      ...(images && { images }),
    };

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      console.log("❌ Product not found:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("✅ Product updated successfully");
    
    res.json({
      message: "✅ Product updated successfully",
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

// Other controllers (unchanged)
const GetAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    console.log(`📊 Returning ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

const GetProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log("❌ Product not found:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("✅ Product found:", product.name);
    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
};

const DeleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      console.log("❌ Product not found for deletion:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("✅ Product deleted:", req.params.id);
    res.json({ message: "✅ Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};

module.exports = {
  Createproduct,
  UpdateProduct,
  GetAllProducts,
  GetProductById,
  DeleteProduct,
};