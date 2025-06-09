import { Router } from "express";
import { getAllProducts } from "../services/products.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import { v4 as uuidv4 } from "uuid";
import Product from '../models/product.js';


const router = Router();

// GET all products
router.get("/", async (req, res, next) => {
  const result = await getAllProducts();

  if (result) {
    res.json({
      success: true,
      products: result,
    });
  } else {
    next({
      status: 404,
      message: "No products found",
    });
  }
});

//POST add new product (Admin)
router.post("/", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can add products",
    });
  }

  const { title, desc, price } = req.body;

  try {
    const newProduct = new Product({
      title,
      desc,
      price,
      prodId: `${uuidv4().slice(0, 5)}`,
      createdAt: new Date()
    });
    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Product save error:", error);
    res.status(500).json({
      success: false,
      message: "Could not save product",
    });
  }
});

//PUT Change an product
router.put("/:prodId", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can update products",
    });
  }

  const {prodId} = req.params;
  const { title, desc, price} = req.body;

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { prodId },
      {
        title,
        desc,
        price,
        modifiedAt: new Date()
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not update product',
    });
  }
});

router.delete('/:prodId', authenticateToken, async (req, res) => {
  // Kontrollera om användaren är admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can delete products',
    });
  }

  const { prodId } = req.params;

  try {
    const deletedProduct = await Product.findOneAndDelete({ prodId });

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      product: deletedProduct,
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not delete product',
    });
  }
});

export default router;
