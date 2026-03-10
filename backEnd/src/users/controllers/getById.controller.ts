import { RequestHandler } from 'express';
import { getUserByIdService } from '../services/getById.service';
import { authMiddleware } from '../../login/middlewares/auth.middleware';

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested user.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error
 */
export const getUserByIdController: RequestHandler = async (req, res) => {
    try {
        const id = String(req.params.id);
        
        // Verificar se o usuário está tentando acessar seu próprio perfil ou é admin
        const userId = (req as any).user?.id || (req as any).user?.userId;
        // Permitir acesso ao próprio perfil ou se for admin
        if (userId && userId !== id && (req as any).user?.role !== 'admin') {
            return res.status(403).json({
                message: 'Você não tem permissão para acessar este perfil'
            });
        }

        const user = await getUserByIdService(id);

        if (!user) {
            return res.status(404).json({
                message: 'Usuário não encontrado'
            });
        }

        // Mapear campos do banco para o formato esperado pelo frontend
        return res.status(200).json({
            id: user.id,
            full_name: user.name || '',
            email: user.email,
            oab: user.oab || '',
            oab_uf: user.oab_uf || '',
            cpf: user.cpf || '',
            phone: user.phone || '',
            specialty: user.specialty || '',
            office: user.office || '',
            user_type: user.role === 'admin' ? 'Administrador' : 'Usuário',
            status: user.active ? 'Ativa' : 'Inativa',
            created_at: user.createdAt.toISOString(),
            username: user.email?.split('@')[0] || '',
        });
    } catch (error) {
        console.error('Error in getUserByIdController:', error);
        return res.status(500).json({
            message: 'Erro ao buscar usuário'
        });
    }
};
