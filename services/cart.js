import Cart from '../models/cart.js';
import Product from '../models/product.js';
import { v4 as uuid } from 'uuid';

export async function getAllCarts() {
  try {
    const carts = await Cart.find();
    return carts;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

export async function getCartById(userId) {
  try {
    let cart = await Cart.findOne({ cartId: userId });
    return cart;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

export async function getOrCreateCart(userId) {
  try {
    let cart = await Cart.findOne({ cartId: userId });
    if (!cart) {
      cart = await Cart.create({
        cartId: userId,
        items: [],
      });
    }
    return cart;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

export async function updateCart(userId, product) {
  try {
    const cart = await getOrCreateCart(userId);
    if (!cart) {
      throw new Error('Could not retrieve cart');
    }

    const item = cart.items.find((item) => item.prodId === product.prodId);
    if (item && product.qty >= 0) {
      item.qty = Math.round(product.qty);
    } else {
      cart.items.push(product);
    }

    if (product.qty < 1) {
      console.log('Radera!');
      cart.items = cart.items.filter((item) => item.prodId !== product.prodId);
    }
    await cart.save();
    return cart;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

export async function updateCartWithProduct(prodId, qty, userId) {
  if (!Number.isInteger(qty) || qty <= 0) {
    throw { status: 400, message: 'Quantity must be a positive integer' };
  }

  const product = await Product.findOne({ prodId });
  if (!product) {
    throw { status: 400, message: 'Invalid product ID' };
  }

  const cart = await updateCart(userId, {
    prodId: product.prodId,
    title: product.title,
    price: product.price,
    qty,
  });

  if (!cart) {
    throw { status: 400, message: 'Could not update cart' };
  }

  return {
    cart,
    guestId: userId.startsWith('guest-') ? userId : undefined,
  };
}