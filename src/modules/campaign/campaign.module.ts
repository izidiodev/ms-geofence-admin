import { container } from '@shared/container/index.js';
import { CampaignRepository } from '@campaign/repositories/campaignRepository/campaignRepository.js';
import { CampaignService } from '@campaign/services/campaignService/campaignService.js';
import { CampaignController } from '@campaign/controllers/campaignController/campaignController.js';
import { ICampaignRepository } from '@campaign/repositories/campaignRepository/ICampaignRepository.js';
import { ICampaignService } from '@campaign/services/campaignService/ICampaignService.js';

export const CAMPAIGN_TOKENS = {
  REPOSITORY: 'CampaignRepository',
  SERVICE: 'CampaignService',
  CONTROLLER: 'CampaignController',
} as const;

export function registerCampaignModule(): void {
  container.register<ICampaignRepository>(
    CAMPAIGN_TOKENS.REPOSITORY,
    () => new CampaignRepository()
  );

  container.register<ICampaignService>(
    CAMPAIGN_TOKENS.SERVICE,
    () =>
      new CampaignService(
        container.resolve<ICampaignRepository>(CAMPAIGN_TOKENS.REPOSITORY)
      )
  );

  container.register<CampaignController>(
    CAMPAIGN_TOKENS.CONTROLLER,
    () =>
      new CampaignController(
        container.resolve<ICampaignService>(CAMPAIGN_TOKENS.SERVICE)
      )
  );
}
