/**
 * Migrations em ordem cronológica (TypeORM executa na sequência do array).
 * Ao gerar nova migration: importe a classe e acrescente ao final.
 */
import { CreateUsersTable1739000000000 } from './migrations/1739000000000-CreateUsersTable.js';
import { CreateTypesTable1739000000001 } from './migrations/1739000000001-CreateTypesTable.js';
import { CreateCampaignsTable1739000000002 } from './migrations/1739000000002-CreateCampaignsTable.js';
import { AddUnaccentExtension1739000000003 } from './migrations/1739000000003-AddUnaccentExtension.js';
import { AddCampaignGroupIdToCampaigns1739000000004 } from './migrations/1739000000004-AddCampaignGroupIdToCampaigns.js';
import { CampaignsAndItemCampaign1739000000005 } from './migrations/1739000000005-CampaignsAndItemCampaign.js';
import { AddDeliveryCountToCampaigns1739000000006 } from './migrations/1739000000006-AddDeliveryCountToCampaigns.js';

export const typeormMigrations = [
  CreateUsersTable1739000000000,
  CreateTypesTable1739000000001,
  CreateCampaignsTable1739000000002,
  AddUnaccentExtension1739000000003,
  AddCampaignGroupIdToCampaigns1739000000004,
  CampaignsAndItemCampaign1739000000005,
  AddDeliveryCountToCampaigns1739000000006,
];
