import { prisma } from '../../lib/prisma'

interface UpdateProcessData {
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
}

export const updateProcess = async (
  id: string,
  data: UpdateProcessData
) => {
  if (!id) throw new Error('ID is required')

  // Mapear campos do frontend para o backend
  const updateData: any = {}

  if (data.processNumber !== undefined || data.case_number !== undefined) {
    updateData.processNumber = data.processNumber || data.case_number
  }
  if (data.type !== undefined || data.case_type !== undefined) {
    updateData.type = data.type || data.case_type
  }
  if (data.court !== undefined) {
    updateData.court = data.court
  }
  if (data.status !== undefined) {
    updateData.status = data.status
  }
  if (data.notes !== undefined) {
    // Campo no banco e obrigatorio; quando vier null do frontend, persistimos como string vazia.
    updateData.internalNotes = data.notes ?? ""
  }
  if (data.documentPath !== undefined || data.document_id !== undefined) {
    updateData.documentPath =
      data.documentPath !== undefined
        ? data.documentPath || null
        : data.document_id || null
  }


  // Atualizar valor da causa (caseValue)
  if (data.value !== undefined && data.value !== null) {
    updateData.caseValue = data.value;
  }

  // Atualizar data de julgamento/audiência (hearingDate)
  if ((data as any).trial_date !== undefined && (data as any).trial_date !== null) {
    updateData.hearingDate = new Date((data as any).trial_date);
  }

  // Relacionamentos
  const clientId = data.clientId || data.client_id
  if (clientId !== undefined) {
    updateData.clientId = clientId || null
  }

  if (data.lawyerId !== undefined) {
    updateData.lawyerId = data.lawyerId || null
  }

  let process: any
  try {
    process = await prisma.process.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })
  } catch (error: any) {
    const isMissingDocumentPath = error?.code === "P2022"
    if (!isMissingDocumentPath) throw error

    const { documentPath, ...legacyUpdateData } = updateData
    process = await prisma.process.update({
      where: { id },
      data: legacyUpdateData,
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
          }
        }
      },
    })
  }

  // Retornar no formato esperado pelo frontend
  return {
    id: process.id,
    client_id: process.clientId || '',
    case_number: process.processNumber,
    case_type: process.type,
    court: process.court,
    judge: null,
    subject: null,
    status: process.status,
    value: process.caseValue ?? null,
    notes: process.internalNotes ?? null,
    document_id: process.documentPath ?? null,
    trial_date: process.hearingDate ? process.hearingDate.toISOString() : null,
    created_at: process.createdAt.toISOString(),
    updated_at: process.updatedAt.toISOString(),
    clients: process.client ? { // Corrected from process.clients
      name: process.client.name // Corrected from process.clients
    } : undefined,
  }
}
