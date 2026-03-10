import { Response } from "express"
import { AuthenticatedRequest } from "../../login/middlewares/auth.middleware"
import { updateClient } from "../../clients/services/update.service"

export const updateClientController = async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id)
  const data = req.body

  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado" })
    }

    const updatedClient = await updateClient(id, userId, data)
    return res.json(updatedClient)
  } catch (error: any) {
    if (error.message?.includes("nao encontrado")) {
      return res.status(404).json({ error: error.message })
    }
    return res.status(500).json({ error: "Failed to update client" })
  }
}
