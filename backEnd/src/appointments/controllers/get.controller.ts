import { Response } from "express"
import { AuthenticatedRequest } from "../../login/middlewares/auth.middleware"
import { appointment } from "../services/get.service"

export const GetAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: "Usuario nao autenticado" })
    }

    const appointments = await appointment(userId)
    return res.status(200).json(appointments)
  } catch (error: any) {
    console.error("Error in get appointments controller:", error.message)
    return res.status(500).json({ error: "Error fetching appointments", details: error.message })
  }
}
