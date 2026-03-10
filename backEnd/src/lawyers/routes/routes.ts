import { Router } from 'express';
import { createController } from '../controllers/create.controller'
import { Getcontroller } from '../controllers/get.controller'
import { GetByIdController } from '../controllers/getById.controller'
import { updateLawyerController } from '../controllers/update.controller';
import { deleteLawyerController } from '../controllers/delete.controller';

export const lawyerRoutes = Router();
lawyerRoutes.get('/lawyer', Getcontroller)
lawyerRoutes.get('/lawyer/:id', GetByIdController)

lawyerRoutes.post('/lawyer', createController)

lawyerRoutes.put('/lawyer/:id', updateLawyerController)
lawyerRoutes.delete('/lawyer/:id', deleteLawyerController)

