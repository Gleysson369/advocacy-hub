import { Response } from "express"
import { AuthenticatedRequest } from "../../login/middlewares/auth.middleware"
import { createPetition } from "../services/create.service"

export async function createPetitionController(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado" })
    }

    const mappedData = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      status: req.body.status,
      addressing: req.body.addressing ?? req.body.enderecamento ?? undefined,
      defendant: req.body.defendant ?? req.body.reu ?? undefined,
      facts: req.body.facts ?? req.body.fatos ?? undefined,
      legalBasis: req.body.legalBasis ?? req.body.fundamentos ?? undefined,
      caseValue: req.body.caseValue ?? req.body.valor_causa ?? undefined,
      closingLocation: req.body.closingLocation ?? req.body.local ?? undefined,
      fileUrl: req.body.fileUrl,
      protocolNumber: req.body.protocolNumber,
      processId: req.body.processId,
      clientId: req.body.clientId ?? req.body.client_id ?? undefined,
      userId,
    }

    if (!mappedData.title) {
      return res.status(400).json({ error: "Titulo e obrigatorio" })
    }
    if (!mappedData.defendant) {
      return res.status(400).json({ error: "Reu e obrigatorio" })
    }
    if (!mappedData.type) {
      return res.status(400).json({ error: "Tipo de peca e obrigatorio" })
    }

    const petition = await createPetition(mappedData)
    return res.status(201).json(petition)
  } catch (error) {
    console.error("Erro ao criar peticao:", error)
    return res.status(500).json({ error: "Erro ao criar peticao" })
  }
}
