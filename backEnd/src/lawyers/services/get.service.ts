import {prisma} from '../../lib/prisma'

export const GetService = async () => {
    try {
        const lawyers = await prisma.lawyer.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                oabNumber: true,
                specialty: true,
                phone: true,
                createdAt: true,
            },
        })
        return lawyers
    } catch (error) {
        console.error('Error fetching lawyers in service:', error)
        throw error
    }
}
