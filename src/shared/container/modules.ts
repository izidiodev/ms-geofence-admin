import { registerUserModule } from '@user/user.module.js';
import { registerAuthModule } from '@auth/auth.module.js';
import { registerTypeModule } from '@type/type.module.js';
import { registerCampaignModule } from '@campaign/campaign.module.js';

export function registerAllModules(): void {
  registerUserModule();
  registerAuthModule();
  registerTypeModule();
  registerCampaignModule();
}
