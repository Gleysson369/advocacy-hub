import { prisma } from '../../lib/prisma';

export const getUsersService = async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        return users;
    } catch (error) {
        console.error(error);
        throw new Error('Error getting users');
    }
};
