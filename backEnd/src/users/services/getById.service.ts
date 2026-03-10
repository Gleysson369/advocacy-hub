import { prisma } from '../../lib/prisma';

export const getUserByIdService = async (id: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                oab: true,
                oab_uf: true,
                cpf: true,
                phone: true,
                specialty: true,
                office: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        return user;
    } catch (error) {
        console.error(error);
        throw new Error('Error getting user by id');
    }
};
