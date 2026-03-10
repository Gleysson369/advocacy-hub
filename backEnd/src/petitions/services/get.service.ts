import { prisma } from "../../lib/prisma"

const mapPetitionToFrontend = (petition: any) => {
  return {
    id: petition.id,
    user_id: petition.userId,
    title: petition.title,
    process_number: petition.process?.processNumber ?? null,
    client_name: petition.client?.name ?? "",
    type: petition.type,
    status: petition.status,
    content_summary: petition.facts ?? null,
    created_at: petition.createdAt?.toISOString?.() ?? petition.createdAt,
    updated_at: petition.updatedAt?.toISOString?.() ?? petition.updatedAt,
    client_id: petition.clientId ?? null,
    process_id: petition.processId ?? null,
    enderecamento: petition.addressing ?? "",
    reu: petition.defendant ?? "",
    fatos: petition.facts ?? "",
    fundamentos: petition.legalBasis ?? "",
    valor_causa: petition.caseValue ? Number(petition.caseValue) : null,
    local: petition.closingLocation ?? "",
    protocol_number: petition.protocolNumber ?? null,
    file_url: petition.fileUrl ?? null,
  }
}

export const getPetitions = async (userId: string) => {
  try {
    const petitions = await prisma.petition.findMany({
      where: {
        userId,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return petitions.map(mapPetitionToFrontend)
  } catch (error: any) {
    console.error("Error fetching petitions:", error)
    throw new Error("Error fetching petitions")
  }
}

export const getPetitionById = async (id: string, userId: string) => {
  try {
    const petition = await prisma.petition.findFirst({
      where: {
        id,
        userId,
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

    if (!petition) {
      throw new Error("Peticao nao encontrada")
    }

    return mapPetitionToFrontend(petition)
  } catch (error: any) {
    console.error("Error fetching petition:", error)
    throw new Error(error.message || "Error fetching petition by id")
  }
}
