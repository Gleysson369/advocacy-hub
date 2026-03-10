import { Response } from "express"
import { AuthenticatedRequest } from "../../login/middlewares/auth.middleware"
import { UpdatePetition } from "../services/update.service"

export async function updatePetitionController(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    const { id } = req.params

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
    }

    const petition = await UpdatePetition(id, userId, mappedData)
    return res.status(200).json(petition)
  } catch (error: any) {
    console.error("Erro ao atualizar peticao:", error)

    if (
      error.message === "Peticao nao encontrada ou nao autorizada" ||
      error.message === "Petição não encontrada ou não autorizada" ||
      error.message === "PetiÃ§Ã£o nÃ£o encontrada ou nÃ£o autorizada"
    ) {
      return res.status(404).json({ error: error.message })
    }

    return res.status(500).json({ error: "Erro ao atualizar peticao" })
  }
}
