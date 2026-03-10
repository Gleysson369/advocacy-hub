import { Response } from "express"
import { AuthenticatedRequest } from "../../login/middlewares/auth.middleware"
import { GetById } from "../services/getById.service"

export const GetByIdAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado" })
    }

    const appointment = await GetById(id, userId)
    return res.status(200).json(appointment)
  } catch (error: any) {
    if (error.message?.includes("nao encontrado")) {
      return res.status(404).json({ error: error.message })
    }
    return res.status(500).json({ error: "Erro ao buscar compromisso" })
  }
}
