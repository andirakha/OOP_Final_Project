import { prisma } from "./prisma";

export const getProducts = async () => {
    try {
        const products = await prisma.product.findMany();
        return products;
    } catch (error) {
        throw new Error("Failed to fetch products data");
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


