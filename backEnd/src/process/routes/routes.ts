import {Router} from 'express'
import {CreateProcessController} from '../controllers/process.controller'
import {GetprocessController} from '../controllers/get.controller'
import {GetProcessById} from '../controllers/getById'
import { updateProcessController} from '../controllers/update.controller'
import {deleteController} from '../controllers/delete.controller'
import { upload } from '../../config/multer.config'
import { UploadController } from '../controllers/upload.controller'
import { DownloadFileController } from '../controllers/download.controller'
import { authMiddleware } from '../../login/middlewares/auth.middleware'


export const ProcessRouter= Router()

ProcessRouter.get("/processes", authMiddleware, GetprocessController)
ProcessRouter.get("/processes/:id", authMiddleware, GetProcessById)
ProcessRouter.post("/processes", authMiddleware, CreateProcessController)
ProcessRouter.post("/processes/upload", authMiddleware, upload.single('file'), UploadController)
ProcessRouter.get("/files/download", authMiddleware, DownloadFileController)
ProcessRouter.put("/processes/:id", authMiddleware, updateProcessController)
ProcessRouter.delete("/processes/:id", authMiddleware, deleteController)
