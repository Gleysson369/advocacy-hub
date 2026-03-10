import { RequestHandler } from 'express'
import { updateLawyer } from '../services/update.service'

export const updateLawyerController: RequestHandler = async (req, res) => {
  try {
    const id = String(req.params.id)
    const data = req.body

    if (!id) {
      return res.status(400).json({ error: 'ID do advogado é obrigatório' })
    }

    const updatedLawyer = await updateLawyer(id, data)
    return res.json(updatedLawyer)
  } catch (error: any) {
    console.error('Erro ao atualizar advogado:', error.message)

    // Validação de dados vazios
    if (error.message?.includes('Nenhum campo válido')) {
      return res.status(400).json({ error: error.message })
    }

    // Advogado não encontrado
    if (error.message?.includes('não encontrado') || error.code === 'P2025') {
      return res.status(404).json({ error: 'Advogado não encontrado' })
    }

    // Email ou OAB duplicados
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email ou OAB já cadastrados' })
    }

    return res.status(500).json({ error: 'Erro ao atualizar advogado', details: error.message })
  }
}



