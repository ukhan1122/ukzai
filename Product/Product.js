const Product = require("../model/productmodel");

const Createproduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;

    console.log("📦 Creating product:", { name, price, stock });
    console.log("🖼️ Raw files:", req.files);

    // Validate and clean Cloudinary URLs
    const images = req.files ? req.files.map((file) => {
      console.log("File object:", file);
      console.log("File path:", file.path);
      
      // Ensure the URL is complete
      if (!file.path || !file.path.startsWith('http')) {
        throw new Error(`Invalid image URL: ${file.path}`);
      }
      
      return file.path;
    }) : [];

    console.log("✅ Clean Cloudinary URLs:", images);

    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      images,
    });

    await newProduct.save();
    
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