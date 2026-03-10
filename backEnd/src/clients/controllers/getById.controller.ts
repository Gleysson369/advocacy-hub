import { Response } from "express"
import { AuthenticatedRequest } from "../../login/middlewares/auth.middleware"
import { getClientById } from "../../clients/services/getById.service"

export const getClientByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: "Usuario nao autenticado" })
    }

    const client = await getClientById(id, userId)

    if (!client) {
      return res.status(404).json({
        message: "Usuario nao encontrado",
      })
    }

    return res.status(200).json(client)
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar usuario",
    })
  }
}
