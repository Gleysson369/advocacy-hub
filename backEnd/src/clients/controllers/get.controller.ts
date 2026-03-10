import { Response } from "express"
import { AuthenticatedRequest } from "../../login/middlewares/auth.middleware"
import { getClients } from "../../clients/services/get.services"

export const getClient = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: "Usuario nao autenticado" })
    }

    const clients = await getClients(userId)
    return res.status(200).json(clients)
  } catch (error: any) {
    console.error("Erro no controller getClient:", error)
    return res.status(500).json({
      message: error.message || "Erro ao buscar usuarios",
      error: error.message,
    })
  }
}
