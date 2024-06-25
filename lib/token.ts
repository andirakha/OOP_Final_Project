// lib/token.ts
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your-secret-key'; // Ganti dengan kunci rahasia yang lebih aman

interface UserPayload {
  id: number;
  username: string;
}

export const createToken = (user: UserPayload): string => {
  try {
    return jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
  } catch (error) {
    console.error('Error creating token:', error);
    return '';
  }
};

export const verifyToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as UserPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};
