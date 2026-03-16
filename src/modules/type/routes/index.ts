import { Router } from 'express';
import { container } from '@shared/container/index.js';
import { TypeController } from '@type/controllers/typeController/typeController.js';
import { TYPE_TOKENS } from '@type/type.module.js';
import { authMiddleware } from '@shared/middlewares/authMiddleware.js';

const router = Router();
const controller = container.resolve<TypeController>(TYPE_TOKENS.CONTROLLER);

router.use(authMiddleware);
router.get('/', controller.findAll);

export default router;
