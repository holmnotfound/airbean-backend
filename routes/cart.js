import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getProduct } from '../services/products.js';
import { updateCart, getOrCreateCart, getAllCarts } from '../services/cart.js';
import { calculateTotal } from '../utils/cartUtils.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = Router();

//GET all carts
router.get('/', async (req, res, next) => {
  const carts = await getAllCarts();
  if (carts) {
    res.json({
      success: true,
      carts,
    });
  } else {
    next({
      status: 500,
      message: 'Could not retrieve carts',
    });
  }
});

// GET cart by ID
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  const cart = await getOrCreateCart(id);
  if (cart) {
    const total = calculateTotal(cart);
    if (cart.items.length > 0) {
      res.json({
        success: true,
        cart,
        total,
      });
    } else {
      res.json({
        success: true,
        message: 'Cart is empty',
      });
    }
  } else {
    next({
      status: 500,
      message: 'Could not get or create cart',
    });
  }
});




router.put('/', authenticateToken, async (req, res, next) => {
  console.log("Authenticated user:", req.user);
  const { prodId, qty, guestId } = req.body;

  if (!Number.isInteger(qty) || qty <= 0) {
    return next({ status: 400, message: 'Quantity must be a positive integer' });
  }

  const product = await getProduct(prodId);
  if (!product) {
    return next({ status: 400, message: 'Invalid product ID' });
  }

  let userId;

  if (req.headers.authorization) {
    // Token finns – försök verifiera
    authenticateToken(req, res, async () => {
      userId = req.user.userId;
      await handleCartUpdate(userId);
    });
  } else {
    // Gäst
    userId = guestId || `guest-${uuid().substring(0, 5)}`;
    await handleCartUpdate(userId);
  }

  async function handleCartUpdate(userId) {
    const cart = await updateCart(userId, {
      prodId: product.prodId,
      title: product.title,
      price: product.price,
      qty,
    });

    if (!cart) {
      return next({ status: 400, message: 'Could not update cart' });
    }

    res.json({
      success: true,
      cart,
      guestId: userId.startsWith('guest-') ? userId : undefined,
    });
  }
});

export default router;
