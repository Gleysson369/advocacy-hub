import { Response } from "express"
import { AuthenticatedRequest } from "../../login/middlewares/auth.middleware"
import { getPetitionById } from "../services/get.service"

export async function GetPetitionByIdController(req: AuthenticatedRequest, res: Response) {
  try {
    const id = String(req.params.id)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado" })
    }

    const petition = await getPetitionById(id, userId)
    return res.status(200).json(petition)
  } catch (error: any) {
    if (error.message?.includes("nao encontrada") || error.message?.includes("nÃ£o encontrada")) {
      return res.status(404).json({ error: "Peticao nao encontrada" })
    }
    return res.status(500).json({ error: error.message || "Erro ao buscar peticao" })
  }
}
