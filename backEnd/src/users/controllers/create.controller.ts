import { Request, Response } from 'express';
import { createUserService } from '../services/create.service';

export const createUserController = async (req: Request, res: Response) => {
    console.log('📨 Requisição recebida para criar usuário:', { body: req.body });
    
    const { name, email, password } = req.body;

    // Validação básica
    if (!name || !email || !password) {
        console.log('❌ Campos obrigatórios faltando');
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    try {
        const user = await createUserService({ name, email, password });
        // Don't return the password hash
        const { password: _, ...userWithoutPassword } = user;
        console.log('✅ Usuário retornado ao frontend:', userWithoutPassword);
        return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
        console.error('❌ Erro no controller:', error.message);
        
        // Tratamento de erro específico para email duplicado
        if (error.message?.includes('já está cadastrado')) {
            return res.status(409).json({ message: error.message });
        }
        
        return res.status(500).json({ message: error.message || 'Error creating user' });
    }
};
