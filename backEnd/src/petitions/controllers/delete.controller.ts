import { RequestHandler } from 'express'
import {DeletePetition} from '../services/delete.service' // Updated import

export const deletePetitionController:RequestHandler= async (req, res) => { // Updated controller name
  const  id  = String (req.params.id)

  try {
    const deletedPetition = await DeletePetition(id) // Updated function call
    return res.json(deletedPetition)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete petition' }) // Updated error message
  }
}
