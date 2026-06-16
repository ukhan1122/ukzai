const Product = require("../model/Product");

// ─── Create ──────────────────────────────────────────────────────────────────

const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock } = req.body;

    if (!name || !price || !description)
      return res.status(400).json({ message: "Name, price and description are required" });

    const images = req.files
      ? req.files.map((file) => {
          if (!file.path?.startsWith("http"))
            throw new Error(`Invalid image URL: ${file.path}`);
          return file.path;
        })
      : [];

    const imagePrices = {};
    images.forEach((img) => (imagePrices[img] = Number(price)));

    const product = await Product.create({
      name,
      description,
      price:       Number(price),
      stock:       Number(stock) || 1,
      images,
      imagePrices,
    });

    res.status(201).json({ message: "Product created successfully", product });

  } catch (err) {
    res.status(400).json({ message: "Error creating product", error: err.message });
  }
};

// ─── Get All ─────────────────────────────────────────────────────────────────

const getAllProducts = async (_req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};

// ─── Get One ─────────────────────────────────────────────────────────────────

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
};

// ─── Update ──────────────────────────────────────────────────────────────────

const updateProduct = async (req, res) => {
  try {
    let { name, price, description, stock, existingImages, imagesToDelete, imagePrices } = req.body;

    // Parse JSON strings sent from frontend FormData
    const parse = (val) => {
      if (typeof val === "string") { try { return JSON.parse(val); } catch { return null; } }
      return val;
    };

    existingImages = parse(existingImages) || [];
    imagesToDelete = parse(imagesToDelete) || [];
    imagePrices    = parse(imagePrices)    || {};

    const existing = await Product.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ message: "Product not found" });

    // Determine which images to keep
    let finalImages =
      existingImages.length > 0
        ? existingImages
        : imagesToDelete.length > 0
        ? existing.images.filter((img) => !imagesToDelete.includes(img))
        : existing.images;

    // Add newly uploaded images
    if (req.files?.length > 0) {
      const newImages = req.files.map((file) => {
        if (!file.path?.startsWith("http"))
          throw new Error(`Invalid image URL: ${file.path}`);
        return file.path;
      });
      finalImages = [...finalImages, ...newImages];
    }

    // Build final image prices
    const finalImagePrices = {};
    finalImages.forEach((img) => {
      finalImagePrices[img] =
        imagePrices[img] != null
          ? Number(imagePrices[img])
          : existing.imagePrices?.[img] != null
          ? Number(existing.imagePrices[img])
          : Number(price || existing.price);
    });

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name:        name        || existing.name,
        description: description || existing.description,
        price:       price       ? Number(price) : existing.price,
        stock:       stock       ? Number(stock) : existing.stock,
        images:      finalImages,
        imagePrices: finalImagePrices,
      },
      { new: true }
    );

    res.json({ message: "Product updated successfully", product: updated });

  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
};

// ─── Delete ──────────────────────────────────────────────────────────────────

const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };