import { Response } from 'express'
import { AuthenticatedRequest } from '../../login/middlewares/auth.middleware'
import { Getprocess } from '../services/get.services'

export const GetprocessController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' })
    }

    const processes = await Getprocess(userId)

    return res.status(200).json(processes)

  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar processos' })
  }
}

