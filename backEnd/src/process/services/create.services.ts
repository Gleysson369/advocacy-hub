import { prisma } from "../../lib/prisma"

interface ProcessCreateServiceData {
  // Campos do frontend
  case_number?: string
  processNumber?: string
  case_type?: string
  type?: string
  court?: string | null
  judge?: string | null
  subject?: string | null
  status?: string
  value?: number | null
  notes?: string | null
  document_id?: string | null
  documentPath?: string | null
  client_id?: string | null
  clientId?: string | null
  lawyerId?: string | null
  trial_date?: string | null
  userId: string
}

export const ProcessCreateService = async (data: ProcessCreateServiceData) => {
  try {
    // Mapear campos do frontend para o backend
    const processNumber = data.processNumber || data.case_number
    const type = data.type || data.case_type
    const clientId = data.clientId || data.client_id

    if (!processNumber) {
      throw new Error("Numero do processo e obrigatorio")
    }
    if (!type) {
      throw new Error("Tipo do processo e obrigatorio")
    }
    if (!data.userId) {
      throw new Error("Usuario nao autenticado")
    }

    if (clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          userId: data.userId,
        },
        select: { id: true },
      })

      if (!client) {
        throw new Error("Cliente nao encontrado para este usuario")
      }
    }

    const hearingDate = (data as any).trial_date
      ? new Date((data as any).trial_date)
      : new Date();

    const createData: any = {
      processNumber,
      court: data.court || null,
      type,
      status: data.status || "open",
      hearingDate,
      caseValue: data.value || 0,
      internalNotes: data.notes || "",
      documentPath: data.documentPath ?? data.document_id ?? null,
      userId: data.userId,
      ...(clientId && {
        clientId,
      }),
    }

    let process: any
    try {
      process = await prisma.process.create({
        data: createData,
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    } catch (error: any) {
      const isMissingDocumentPath = error?.code === "P2022"
      if (!isMissingDocumentPath) throw error

      const { documentPath, ...legacyData } = createData
      process = await prisma.process.create({
        data: legacyData,
        select: {
          id: true,
          processNumber: true,
          court: true,
          type: true,
          status: true,
          hearingDate: true,
          caseValue: true,
          internalNotes: true,
          userId: true,
          clientId: true,
          createdAt: true,
          updatedAt: true,
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    // Retornar no formato esperado pelo frontend
    return {
      id: process.id,
      client_id: process.clientId,
      case_number: process.processNumber,
      case_type: process.type,
      court: process.court,
      judge: null, // Campo nao existe no schema
      subject: null, // Campo nao existe no schema
      status: process.status,
      value: process.caseValue ? Number(process.caseValue) : null,
      notes: process.internalNotes ?? null,
      document_id: process.documentPath ?? null,
      trial_date: process.hearingDate ? process.hearingDate.toISOString() : null,
      created_at: process.createdAt.toISOString(),
      updated_at: process.updatedAt.toISOString(),
      clients: process.client
        ? {
            name: process.client.name,
          }
        : undefined,
    }
  } catch (error: any) {
    console.error("ERRO REAL:", error)
    throw new Error(error.message || "Erro ao criar processo")
  }
}
