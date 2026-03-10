import { prisma } from '../../lib/prisma'

export const Getprocess = async (userId: string) => {
  try {
    let processes: any[]
    try {
      processes = await prisma.process.findMany({
        where: {
          userId,
        },
        include: { 
          client: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } catch (error: any) {
      const isMissingDocumentPath = error?.code === "P2022"
      if (!isMissingDocumentPath) throw error

      processes = await prisma.process.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          processNumber: true,
          court: true,
          type: true,
          status: true,
          hearingDate: true,
          caseValue: true,
          internalNotes: true,
          createdAt: true,
          updatedAt: true,
          clientId: true,
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    // Mapear para o formato esperado pelo frontend
    return processes.map(process => ({
      id: process.id,
      client_id: process.clientId || '',
      case_number: process.processNumber,
      case_type: process.type,
      court: process.court,
      judge: null, // Campo não existe no schema
      subject: null, // Campo não existe no schema
      status: process.status,
      value: process.caseValue ?? null,
      notes: process.internalNotes ?? null,
      document_id: process.documentPath ?? null,
      trial_date: process.hearingDate ? process.hearingDate.toISOString() : null,
      created_at: process.createdAt.toISOString(),
      updated_at: process.updatedAt.toISOString(),
      clients: process.client ? {
        name: process.client.name
      } : undefined,
    }))

  } catch (error) {
    console.error(error)
    throw new Error('Erro ao buscar processos')
  }
}
