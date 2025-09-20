const Product = require("../Model/productModel");

// ✅ Create product with multiple images
const Createproduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;

    // Map all uploaded files to filenames
    const images = req.files ? req.files.map((file) => `uploads/${file.filename}`) : [];

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      images,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ message: "Error creating product", error: error.message });
  }
};

// ✅ Update product with multiple images
const UpdateProduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;

    // If new images are uploaded, replace; otherwise keep old images
    const images = req.files ? req.files.map((file) => `uploads/${file.filename}`) : undefined;

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

    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated successfully", product: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// ✅ Other controllers remain unchanged
const GetAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

const GetProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

const DeleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

module.exports = {
  Createproduct,
  GetAllProducts,
  GetProductById,
  UpdateProduct,
  DeleteProduct,
};
