'use server';

import { prisma } from './prisma';
import { getCarts, getUserIdByUsername, getUsers, getProducts } from './data';
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

