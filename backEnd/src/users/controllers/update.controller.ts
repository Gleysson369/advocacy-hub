import { RequestHandler } from 'express';
import { updateUserService } from '../services/update.service';

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               oab:
 *                 type: string
 *               oab_uf:
 *                 type: string
 *               cpf:
 *                 type: string
 *               phone:
 *                 type: string
 *               specialty:
 *                 type: string
 *               office:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error
 */
export const updateUserController: RequestHandler = async (req, res) => {
    try {
        const id = String(req.params.id);
        
        // Verificar se o usuário está tentando atualizar seu próprio perfil ou é admin
        const userId = (req as any).user?.id || (req as any).user?.userId;
        // Permitir atualização do próprio perfil ou se for admin
        if (userId && userId !== id && (req as any).user?.role !== 'admin') {
            return res.status(403).json({
                message: 'Você não tem permissão para atualizar este perfil'
            });
        }

        const { full_name, email, oab, oab_uf, cpf, phone, specialty, office } = req.body;

        const user = await updateUserService(id, {
            name: full_name,
            email,
            oab,
            oab_uf,
            cpf,
            phone,
            specialty,
            office,
        });

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
        console.error('Error in updateUserController:', error);
        return res.status(500).json({
            message: 'Erro ao atualizar usuário'
        });
    }
};
