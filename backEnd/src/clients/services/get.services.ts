import { prisma } from "../../lib/prisma"

export const getClients = async (userId: string) => {
  try {
    let clients: any[]
    try {
      clients = await prisma.client.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } catch (error: any) {
      const isMissingDocumentPath = error?.code === "P2022"
      if (!isMissingDocumentPath) throw error

      clients = await prisma.client.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
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

    return clients.map((client) => ({
      ...client,
      notes: client.notes ?? null,
      cpf_cnpj: client.cpf || client.cnpj || null,
      document_id: client.documentPath ?? null,
      created_at: client.createdAt?.toISOString?.() ?? null,
      updated_at: client.updatedAt?.toISOString?.() ?? null,
    }))
  } catch (error) {
    throw new Error("Erro ao buscar usuarios")
  }
}
