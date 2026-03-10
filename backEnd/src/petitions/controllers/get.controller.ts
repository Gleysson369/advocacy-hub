// src/petitions/controllers/get.controller.ts
import { Response } from 'express'
import { AuthenticatedRequest } from '../../login/middlewares/auth.middleware'
import { getPetitions } from '../services/get.service'

export async function getPetitionsController(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const petitions = await getPetitions(userId) // ⭐ PASSAR userId

    return res.status(200).json(petitions)
  } catch (error) {
    console.error('Erro ao buscar petições:', error)
    return res.status(500).json({ error: 'Erro ao buscar petições' })
  }
}