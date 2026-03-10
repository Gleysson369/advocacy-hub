import { Response } from "express"
import { AuthenticatedRequest } from "../../login/middlewares/auth.middleware"
import { CreateService } from "../services/create.service"

export const createAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: "Usuario nao autenticado" })
    }

    const appointment = await CreateService({
      ...req.body,
      userId,
    })

    return res.status(201).json(appointment)
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Error creating appointment" })
  }
}
