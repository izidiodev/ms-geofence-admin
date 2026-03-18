import { Router } from 'express';
import { container } from '@shared/container/index.js';
import { CampaignController } from '@campaign/controllers/campaignController/campaignController.js';
import { CAMPAIGN_TOKENS } from '@campaign/campaign.module.js';
import { authMiddleware } from '@shared/middlewares/authMiddleware.js';

const router = Router();
const controller = container.resolve<CampaignController>(CAMPAIGN_TOKENS.CONTROLLER);

// Rota pública para o app: GET /campaigns/available (sem JWT)
router.get('/available', controller.findAvailable);

// Rotas protegidas (admin)
router.use(authMiddleware);

router.get('/', controller.findAll);
router.get('/delivery-stats', controller.getDeliveryStats);
router.post('/', controller.create);
router.post('/:id/items', controller.addItem);
router.get('/:id', controller.findById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
