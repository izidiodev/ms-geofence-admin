import { Router } from 'express';
import { container } from '@shared/container/index.js';
import { AuthController } from '../controllers/authController/authController.js';
import { AUTH_TOKENS } from '../auth.module.js';

const router = Router();
const controller = container.resolve<AuthController>(AUTH_TOKENS.CONTROLLER);

router.post('/login', controller.login);

export default router;
