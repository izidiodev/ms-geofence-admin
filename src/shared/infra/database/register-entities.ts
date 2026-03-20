/**
 * Entidades TypeORM registradas explicitamente.
 * Evita globs (src vs dist) e falhas em produção ao carregar .ts via Node.
 * Ao criar nova entidade: importe e adicione ao array.
 */
import { CampaignEntity, ItemCampaignEntity } from '@campaign/entities/campaign.entity.js';
import { TypeEntity } from '@type/entities/type.entity.js';
import { UserEntity } from '@user/entities/user.entity.js';

export const typeormEntities = [
  UserEntity,
  TypeEntity,
  CampaignEntity,
  ItemCampaignEntity,
];
