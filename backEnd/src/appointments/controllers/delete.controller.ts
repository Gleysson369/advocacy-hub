import { Response } from "express"
import { AuthenticatedRequest } from "../../login/middlewares/auth.middleware"
import { deleteAppointment } from "../services/delete.service"

export const deleteAppointmentController = async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id)
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado" })
    }

    await deleteAppointment(id, userId)
    return res.status(204).send()
  } catch (error: any) {
    if (error.message?.includes("nao encontrado")) {
      return res.status(404).json({ error: error.message })
    }
    return res.status(500).json({ error: "Failed to delete appointment" })
  }
}
