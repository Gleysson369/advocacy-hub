import { Response } from 'express'
import { AuthenticatedRequest } from '../../login/middlewares/auth.middleware'
import { ProcessCreateService } from '../services/create.services'

export const CreateProcessController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' })
    }

    const process = await ProcessCreateService({
      ...req.body,
      userId,
    })

    return res.status(201).json(process)
  } catch (error: any) {
    console.error('Error creating process:', error)
    return res.status(500).json({ 
      message: error.message || 'Erro ao criar processo' 
    })
  }
}
