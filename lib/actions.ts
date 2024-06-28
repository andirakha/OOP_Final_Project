'use server';

import { prisma } from './prisma';
import { getCarts, getUserIdByUsername, getUsers, getProducts, getCartItems } from './data';
import { createToken } from '@/lib/token';

export const handleSignUp = async (
  username: string,
  email: string,
  password: string,
  retypePassword: string
) => {

  try {
    const users = await getUsers();
    const usercheck = users.find(usercheck => usercheck.username === username);
    const emailcheck = users.find(emailcheck => emailcheck.email === email);

    if (password !== retypePassword) {
      throw new Error('Passwords do not match');
    }

    if (usercheck) {
      throw new Error('Username already used');
    }
  
    if (emailcheck) {
      throw new Error('Email already used');
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: password,
      },
    });

    console.log('User created:', newUser);
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const fetchProducts = async () => {
  try {
    const fetchedProducts = await getProducts();
    return fetchedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

export const fetchCartItems = async () => {
  try {
    const fetchedCartItems = await getCartItems();
    return fetchedCartItems;
  } catch (error) {
    console.error('Error fetching cart items:', error);
  }
};

export const fetchCarts = async () => {
  try {
    const fetchedCarts = await getCarts();
    return fetchedCarts;
  } catch (error) {
    console.error('Error fetching carts:', error);
  }
};

export const loginUser = async (username: string, password: string) => {
  try {
    const users = await getUsers();
    const user = users.find(user => user.username === username);

    if (!user) {
      throw new Error('User not found');
    }

    if (password != user.password) {
      throw new Error('Incorrect password ');
    }
    
    return { user };
  } catch (error) {
    console.error('Failed to login:', error);
    throw error; // Re-throw the specific error caught for clarity
  }
};

export const checkIdCart = async (username: string) => {
  try {
    const userId = await getUserIdByUsername(username);

    const carts = await getCarts();
    const cart = carts.find(cart => cart.userId === userId);

    if (!cart) {
      const newCart = await prisma.cart.create({
        data: {
          userId,
        },
      });
      console.log('Cart created for user:', newCart);
    }
  } catch (error) {
    console.error('Failed to check userId in cart:', error);
    throw new Error('Failed to check userId in cart. Please try again.');
  }
};

export const addToCart = async (productId: number, quantity: number, userId: number, cartId: number) => {
  try {
    // Cari keranjang aktif untuk pengguna
    let cart = await prisma.cart.findFirst({
      where: {
        id: cartId,// Memeriksa apakah produk sudah ada di keranjang
      },
      include: {
        items: true // Termasukkan detail item di dalam keranjang
      }
    });

    if (!cart) {
      // Jika tidak ada keranjang, buat keranjang baru
      cart = await prisma.cart.create({
        data: {
          userId,
          items: {
            create: [{ productId, quantity }]
          }
        },
        include: {
          items: true
        }
      });
    } else {
      // Jika keranjang sudah ada, tambahkan produk atau update kuantitasnya
      const existingCartItem = cart.items.find(item => item.productId === productId);

      if (existingCartItem) {
        // Jika produk sudah ada di keranjang, tambahkan kuantitasnya
        await prisma.cartItem.update({
          where: {
            id: existingCartItem.id
          },
          data: {
            quantity: existingCartItem.quantity + quantity
          }
        });
      } else {
        // Jika produk belum ada di keranjang, tambahkan sebagai item baru
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity
          }
        });
      }

      // Ambil kembali keranjang dengan item-item terbaru
      cart = await prisma.cart.findUnique({
        where: {
          id: cart.id
        },
        include: {
          items: true
        }
      });
    }

    return cart; // Mengembalikan keranjang yang telah diperbarui atau baru dibuat
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw new Error('Failed to add to cart');
  }
};

export const getCartIdByUserId = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        carts: true, // Termasuk informasi keranjang dari pengguna
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Misalnya, kita mengambil cartId dari keranjang pertama pengguna
    const cartId = user.carts[0]?.id; // Mengambil id dari keranjang pertama

    if (!cartId) {
      throw new Error('Cart not found for the user');
    }

    return cartId;
  } catch (error) {
    console.error('Error fetching cartId:', error);
    throw new Error('Failed to fetch cartId');
  }
};

export async function checkout(cartId: number) {
  try {
    // Cari semua cartItem dengan cardId yang sesuai
    const cartItems = await prisma.cartItem.findMany({
      where: {
        cartId: cartId
      },
    });

    // Hapus semua cartItem yang ditemukan
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cartId,
      },
    });
    console.log("Checkout berhasil, kembali ke dashboard");
  } catch (error) {
    console.error('Error saat melakukan checkout:', error);
    // Tangani error sesuai kebutuhan aplikasi Anda
  } finally {
    await prisma.$disconnect(); // Pastikan untuk memutus koneksi Prisma setelah selesai
  }
}

