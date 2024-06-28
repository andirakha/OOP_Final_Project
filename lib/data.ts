import { prisma } from "./prisma";

export const getProducts = async () => {
    try {
        const products = await prisma.product.findMany();
        return products;
    } catch (error) {
        throw new Error("Failed to fetch products data");
    }
}

export const getCartItems = async () => {
    try {
        const cartItems = await prisma.cartItem.findMany();
        return cartItems;
    } catch (error) {
        throw new Error("Failed to fetch cart items data");
    }
}

export const getUsers = async () => {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (error) {
        throw new Error("Failed to fetch users data");
    }
}

export const getCarts = async () => {
    try {
        const carts = await prisma.cart.findMany();
        return carts;
    } catch (error) {
        throw new Error("Failed to fetch carts data");
    }
}

export const getUserIdByUsername = async (username: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        if (user) {
            return user.id;
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        throw new Error("Failed to fetch user data: " + error);
    }
}

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




