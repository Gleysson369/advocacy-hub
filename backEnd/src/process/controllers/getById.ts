import { RequestHandler } from 'express'
import { GetById } from '../services/getById.service'

export const GetProcessById: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id

    const process = await GetById(id) // 🔥 chama a função

    res.status(200).json(process)

  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
}
