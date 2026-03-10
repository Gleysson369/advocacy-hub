import { Request, Response } from 'express';
import { createService } from '../services/create.service';

export const createController = async (req: Request, res: Response) => {
    try {
        const lawyer = await createService(req.body);
        return res.status(201).json(lawyer);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};