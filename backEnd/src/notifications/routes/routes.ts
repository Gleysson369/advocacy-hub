import { Router } from 'express'
import { authMiddleware } from '../../login/middlewares/auth.middleware'

const notificationsRouter = Router()

// Endpoint temporário para manter compatibilidade com o frontend
notificationsRouter.get('/notifications', authMiddleware, (_req, res) => {
  return res.status(200).json([])
})

notificationsRouter.patch('/notifications/:id/read', authMiddleware, (_req, res) => {
  return res.status(204).send()
})

notificationsRouter.patch('/notifications/read-all', authMiddleware, (_req, res) => {
  return res.status(204).send()
})

notificationsRouter.delete('/notifications/:id', authMiddleware, (_req, res) => {
  return res.status(204).send()
})

export { notificationsRouter }
