import { Router } from 'express';
import userRoutes from '../modules/user/routes/index.js';
import authRoutes from '../modules/auth/routes/index.js';
import typeRoutes from '../modules/type/routes/index.js';
import campaignRoutes from '../modules/campaign/routes/index.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/types', typeRoutes);
router.use('/campaigns', campaignRoutes);

export default router;
