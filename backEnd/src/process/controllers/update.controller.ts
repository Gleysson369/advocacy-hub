import { RequestHandler } from 'express'
import { updateProcess } from '../../process/services/update.service'

export const updateProcessController: RequestHandler = async (req, res) => {
  try {
    const id = String(req.params.id)
    const data = req.body

    if (!id) {
      return res.status(400).json({ error: 'ID do processo é obrigatório' })
    }

    const updatedProcess = await updateProcess(id, data)
    return res.json(updatedProcess)
  } catch (error: any) {
    console.error('Erro ao atualizar processo:', error.message)

    // Validação de dados vazios
    if (error.message?.includes('Nenhum campo válido')) {
      return res.status(400).json({ error: error.message })
    }

    // Processo não encontrado
    if (error.message?.includes('não encontrado') || error.code === 'P2025') {
      return res.status(404).json({ error: 'Processo não encontrado' })
    }

    // ProcessNumber duplicado
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Número do processo já cadastrado' })
    }

    return res.status(500).json({ error: 'Erro ao atualizar processo', details: error.message })
  }
}
