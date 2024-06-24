'use server';

import { prisma } from './prisma';
import { getCarts, getUserIdByUsername, getUsers } from './data';
import bcrypt from 'bcryptjs';

export const handleSignUp = async (
  username: string,
  email: string,
  password: string,
  retypePassword: string
) => {
  try {
    if (password !== retypePassword) {
      throw new Error('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log('User created:', newUser);
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Error creating user. Please try again.');
  }
};

export const loginUser = async (username: string, password: string) => {
  try {
    const users = await getUsers();
    const user = users.find(user => user.username === username);

    if (!user) {
      throw new Error('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Incorrect password');
    }

    return user;
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
