import { Router } from 'express'
import { authMiddleware } from '../../login/middlewares/auth.middleware' // ⭐ IMPORTAR O MIDDLEWARE
import { createController} from '../../clients/controllers/create.controller'
import { getClient } from '../../clients/controllers/get.controller'
import { getClientByIdController } from '../../clients/controllers/getById.controller'
import { updateClientController } from '../controllers/update.controller'
import { deleteClientController } from '../controllers/delete.controller'

const router = Router()

router.post("/clients", authMiddleware, createController)
router.get("/clients", authMiddleware, getClient)
router.get("/clients/:id", authMiddleware, getClientByIdController)
router.put("/clients/:id", authMiddleware, updateClientController)
router.delete("/clients/:id", authMiddleware, deleteClientController)

export { router }
