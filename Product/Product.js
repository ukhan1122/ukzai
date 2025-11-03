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

    // Create initial imagePrices with main price for all images
    const imagePrices = {};
    images.forEach(img => {
      imagePrices[img] = Number(price); // Set main price for all images initially
    });

    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      images,
      imagePrices // ✅ NEW: Include image prices
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

// ✅ UPDATED FUNCTION - Now handles image prices and deletion properly
const UpdateProduct = async (req, res) => {
  try {
    let { name, price, description, stock, existingImages, imagesToDelete, imagePrices } = req.body;
    
    console.log("🔄 Updating product:", req.params.id);
    console.log("📝 Update data:", { name, price, description, stock });
    console.log("🖼️ Existing images from request:", existingImages);
    console.log("🗑️ Images to delete:", imagesToDelete);
    console.log("💰 Image prices:", imagePrices);
    console.log("🆕 New files received:", req.files ? req.files.length : 0);

    // Parse JSON data if it's sent as string
    if (typeof existingImages === 'string') {
      try {
        existingImages = JSON.parse(existingImages);
      } catch (e) {
        console.log("❌ Failed to parse existingImages as JSON");
      }
    }
    
    if (typeof imagesToDelete === 'string') {
      try {
        imagesToDelete = JSON.parse(imagesToDelete);
      } catch (e) {
        console.log("❌ Failed to parse imagesToDelete as JSON");
      }
    }

    if (typeof imagePrices === 'string') {
      try {
        imagePrices = JSON.parse(imagePrices);
      } catch (e) {
        console.log("❌ Failed to parse imagePrices as JSON");
      }
    }

    // Get the existing product first
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      console.log("❌ Product not found:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("📸 Current images in DB:", existingProduct.images);
    console.log("💰 Current image prices in DB:", existingProduct.imagePrices);

    let finalImages = [];
    let finalImagePrices = { ...existingProduct.imagePrices }; // Start with existing prices

    // CASE 1: If existingImages is provided, use it (frontend sent specific images to keep)
    if (existingImages && existingImages.length > 0) {
      console.log("🔄 Using existingImages from request");
      finalImages = Array.isArray(existingImages) ? existingImages : [existingImages];
      
      // Filter imagePrices to only include existing images
      finalImagePrices = {};
      existingImages.forEach(img => {
        if (existingProduct.imagePrices && existingProduct.imagePrices[img]) {
          finalImagePrices[img] = existingProduct.imagePrices[img];
        } else {
          finalImagePrices[img] = Number(price); // Use main price as default
        }
      });
    } 
    // CASE 2: If imagesToDelete is provided, remove those images from current images
    else if (imagesToDelete && imagesToDelete.length > 0) {
      console.log("🗑️ Removing deleted images from current images");
      finalImages = existingProduct.images.filter(img => !imagesToDelete.includes(img));
      
      // Remove prices for deleted images
      finalImagePrices = {};
      finalImages.forEach(img => {
        if (existingProduct.imagePrices && existingProduct.imagePrices[img]) {
          finalImagePrices[img] = existingProduct.imagePrices[img];
        } else {
          finalImagePrices[img] = Number(price); // Use main price as default
        }
      });
    }
    // CASE 3: Otherwise keep all existing images
    else {
      console.log("🔄 Keeping all existing images");
      finalImages = existingProduct.images;
      finalImagePrices = existingProduct.imagePrices || {};
    }

    // Add new images if provided
    if (req.files && req.files.length > 0) {
      console.log("🆕 Adding new images");
      const newImages = req.files.map((file) => {
        console.log("Update - File path:", file.path);
        if (!file.path || !file.path.startsWith('http')) {
          throw new Error(`Invalid image URL: ${file.path}`);
        }
        return file.path;
      });
      
      // Add new images to final array
      finalImages = [...finalImages, ...newImages];
      
      // Set prices for new images (use main price as default)
      newImages.forEach(img => {
        finalImagePrices[img] = Number(price);
      });
    }

    // Update with new image prices from request
    if (imagePrices && typeof imagePrices === 'object') {
      console.log("💰 Updating image prices from request");
      Object.keys(imagePrices).forEach(img => {
        if (finalImages.includes(img)) { // Only update prices for images that exist
          finalImagePrices[img] = Number(imagePrices[img]);
        }
      });
    }

    console.log("✅ Final images array:", finalImages);
    console.log("💰 Final image prices:", finalImagePrices);

    const updateData = {
      name: name || existingProduct.name,
      description: description || existingProduct.description,
      price: price ? Number(price) : existingProduct.price,
      stock: stock ? Number(stock) : existingProduct.stock,
      images: finalImages, // Use the processed images array
      imagePrices: finalImagePrices // ✅ NEW: Include updated image prices
    };

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    console.log("✅ Product updated successfully");
    console.log("📸 Updated product images:", updated.images);
    console.log("💰 Updated product image prices:", updated.imagePrices);
    
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