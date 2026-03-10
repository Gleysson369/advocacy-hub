import { prisma } from "../../lib/prisma"

export const getClientById = async (id: string, userId: string) => {
  let client: any
  try {
    client = await prisma.client.findFirst({
      where: {
        id,
        userId,
      },
    })
  } catch (error: any) {
    const isMissingDocumentPath = error?.code === "P2022"
    if (!isMissingDocumentPath) throw error

    client = await prisma.client.findFirst({
      where: { id, userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        cnpj: true,
        address: true,
        city: true,
        state: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  if (!client) {
    return null
  }

  return {
    ...client,
    notes: client.notes ?? null,
    cpf_cnpj: client.cpf || client.cnpj || null,
    document_id: client.documentPath ?? null,
  }
}
