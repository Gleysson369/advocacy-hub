import {createAppointment} from '../controllers/create.controller'
import {GetAppointment} from '../controllers/get.controller'
import {GetByIdAppointment}  from '../controllers/getById.controller'
import { updateAppointmentController } from '../controllers/update.controller'
import { deleteAppointmentController } from '../controllers/delete.controller'
import {Router} from 'express'
import { authMiddleware } from '../../login/middlewares/auth.middleware'

export const appointmentRoutes= Router()

appointmentRoutes.post("/appointments", authMiddleware, createAppointment)
appointmentRoutes.get("/appointments", authMiddleware, GetAppointment)
appointmentRoutes.get("/appointments/:id", authMiddleware, GetByIdAppointment)
appointmentRoutes.put("/appointments/:id", authMiddleware, updateAppointmentController)
appointmentRoutes.delete("/appointments/:id", authMiddleware, deleteAppointmentController)
