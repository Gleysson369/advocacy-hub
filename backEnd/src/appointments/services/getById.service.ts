import { prisma } from "../../lib/prisma"

export const GetById = async (id: string, userId: string) => {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      process: {
        select: {
          id: true,
          processNumber: true,
        },
      },
    },
  })

  if (!appointment) {
    throw new Error("Compromisso nao encontrado")
  }

  return appointment
}
