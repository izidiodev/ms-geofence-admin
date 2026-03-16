import { Router } from 'express';
import { container } from '@shared/container/index.js';
import { UserController } from '@user/controllers/userController/userController.js';
import { USER_TOKENS } from '@user/user.module.js';
import { authMiddleware } from '@shared/middlewares/authMiddleware.js';

const router = Router();
const controller = container.resolve<UserController>(USER_TOKENS.CONTROLLER);

router.use(authMiddleware);

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
