import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { updateCartWithProduct, getOrCreateCart, getAllCarts } from '../services/cart.js';
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

//Update Cart
router.put('/', authenticateToken, async (req, res, next) => {
  const { prodId, qty, guestId } = req.body;

  const userId = req.user?.userId || guestId || `guest-${uuid().substring(0, 5)}`;

  try {
    const { cart, guestId } = await updateCartWithProduct(prodId, qty, userId);

    res.json({
      success: true,
      cart,
      guestId,
    });
  } catch (error) {
    next({
      status: 500,
      message: 'Could not uppdate cart',
    });
  }
});

export default router;
