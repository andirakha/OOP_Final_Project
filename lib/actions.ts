'use server'

import { prisma } from './prisma';
import { getCarts, getUserIdByUsername, getUsers } from './data';

export const handleSignUp = async (
  username: string,
  email: string,
  password: string,
  retypePassword: string
) => {
  try {
    // Pengecekan apakah password dan retypePassword sama
    if (password !== retypePassword) {
      throw new Error('Passwords do not match');
    }

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: password, // Pastikan untuk menghash password di aplikasi yang sebenarnya
      },
    });

    console.log('User created:', newUser);
    // Redirect to another page after successful signup
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    if (error) {
      throw new Error(`${error}`); // Beritahu pengguna untuk memeriksa konsol
    } else {
      throw new Error('Error creating user. Check console for detail.'); // Beritahu pengguna untuk memeriksa konsol
    }
  } finally {
    await prisma.$disconnect();
  }
};


export const loginUser = async (
    username: string, 
    password: string
) => {
    try {
        const users = await getUsers(); // Mendapatkan semua user dari database

        // Cari user dengan username yang cocok
        const user = users.find(user => user.username === username);

        // Jika user tidak ditemukan
        if (!user) {
            throw new Error('User not found');
        }

        // Verifikasi password
        if (user.password !== password) {
            throw new Error('Incorrect password');
        }

        // Jika user dan password cocok, kembalikan objek user
        return user;

    } catch (error) {
        throw new Error(`Failed to login: ${error}`);
    }
}

export const checkIdCart = async (username: string) => {
  const userId = await getUserIdByUsername(username);
  try {
    // Mencari apakah ada record dengan userId yang diberikan di tabel cart
    const carts = await getCarts();
    const cart = carts.find(cart => cart.userId === userId);

    // Jika cart ditemukan, berarti userId sudah ada di tabel cart
    if (!cart) {
      const newUser = await prisma.cart.create({
        data: {
          userId: userId
        },
      });
      console.log('User created:', newUser);
    }
  } catch (error) {
    throw new Error("Failed to check userId in cart");
  }
}
