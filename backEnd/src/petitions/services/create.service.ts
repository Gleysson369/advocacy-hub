import { prisma } from "../../lib/prisma"
import { PetitionStatus, PetitionType } from "../../../generated/prisma"

interface DataPetition {
  title: string
  description?: string
  type: PetitionType
  status?: PetitionStatus
  addressing?: string
  defendant: string
  facts?: string
  legalBasis?: string
  caseValue?: number
  closingLocation?: string
  fileUrl?: string
  protocolNumber?: string
  userId: string
  processId?: string
  clientId?: string
}

export const createPetition = async (data: DataPetition) => {
  const petition = await prisma.petition.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status ?? PetitionStatus.DRAFT,
      addressing: data.addressing,
      defendant: data.defendant,
      facts: data.facts,
      legalBasis: data.legalBasis,
      caseValue: data.caseValue,
      closingLocation: data.closingLocation,
      fileUrl: data.fileUrl,
      protocolNumber: data.protocolNumber,
      userId: data.userId,
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
        },
      },
    },
  })

  return petition
}
