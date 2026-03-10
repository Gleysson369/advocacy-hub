import { prisma } from "../../lib/prisma"

export const deleteClient = async (id: string, userId: string) => {
  const existing = await prisma.client.findFirst({
    where: { id, userId },
    select: { id: true },
  })

  if (!existing) {
    throw new Error("Cliente nao encontrado")
  }

  const client = await prisma.client.delete({
    where: {
      id,
    },
  })

  return client
}
