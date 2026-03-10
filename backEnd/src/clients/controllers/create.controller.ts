import { Response } from 'express'
import { CreateClient } from '../services/create.service'
import { AuthenticatedRequest } from '../../login/middlewares/auth.middleware' // ✅ Vai funcionar!

export async function createController(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const client = await CreateClient({
      ...req.body,
      userId: userId,
    })

    return res.status(201).json(client)
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error)
    return res.status(500).json({ error: error.message || 'Erro ao criar cliente' })
  }
}