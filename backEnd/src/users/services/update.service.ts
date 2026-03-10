import { prisma } from '../../lib/prisma';

interface UpdateUserData {
    name?: string;
    email?: string;
    oab?: string;
    oab_uf?: string;
    cpf?: string;
    phone?: string;
    specialty?: string;
    office?: string;
}

export const updateUserService = async (id: string, data: UpdateUserData) => {
    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                oab: data.oab,
                oab_uf: data.oab_uf,
                cpf: data.cpf,
                phone: data.phone,
                specialty: data.specialty,
                office: data.office,
            },
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
        throw new Error('Error updating user');
    }
};
