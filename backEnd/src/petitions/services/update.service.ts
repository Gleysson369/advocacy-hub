import { prisma } from "../../lib/prisma"

interface UpdatePetitionData {
  title?: string
  description?: string
  type?: string
  status?: string
  addressing?: string
  defendant?: string
  facts?: string
  legalBasis?: string
  caseValue?: number
  closingLocation?: string
  fileUrl?: string
  protocolNumber?: string
  processId?: string
  clientId?: string
}

export const UpdatePetition = async (id: string, userId: string, data: UpdatePetitionData) => {
  try {
    const existingPetition = await prisma.petition.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingPetition) {
      throw new Error("Peticao nao encontrada ou nao autorizada")
    }

    return await prisma.petition.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        addressing: data.addressing,
        defendant: data.defendant,
        facts: data.facts,
        legalBasis: data.legalBasis,
        caseValue: data.caseValue,
        closingLocation: data.closingLocation,
        fileUrl: data.fileUrl,
        protocolNumber: data.protocolNumber,
        processId: data.processId,
        clientId: data.clientId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
            cnpj: true,
          },
        },
        process: {
          select: {
            id: true,
            processNumber: true,
            court: true,
            type: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            oab: true,
            specialty: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error updating petition:", error)
    throw error
  }
}
