import { RequestHandler } from 'express'
import {GetService} from '../services/get.service'


export const Getcontroller:RequestHandler=async(req,res)=>{
    try{
        const lawyer = await GetService()
        if (!lawyer || lawyer.length === 0) {
            return res.status(404).json({ message: 'No lawyers found' })
        }
        return res.status(200).json(lawyer) 
    }catch(error: any){      
        console.error('Error in get lawyers controller:', error.message)
        return res.status(500).json({ error: 'Error fetching lawyers', details: error.message })
    }
}