import {
  Campaign,
  CampaignDeliveryStatsItem,
  CreateCampaignDTO,
  ItemCampaign,
  ItemCampaignInput,
  UpdateCampaignDTO,
} from '@campaign/models/campaign.js';

export type SearchInFilter = 'name' | 'city_uf' | 'both';

export interface CampaignListFilters {
  search?: string;
  search_in?: SearchInFilter;
  is_deleted?: boolean;
  enabled?: boolean;
}

export interface AvailableCampaignFilters {
  search?: string;
  search_in?: SearchInFilter;
  is_deleted?: boolean;
  enabled?: boolean;
  onlyActive?: boolean;
}

export interface CampaignWithItems {
  campaign: Campaign;
  items: Array<ItemCampaign & { type_name: string }>;
}

export interface ICampaignRepository {
  findAllPaginated(
    page: number,
    limit: number,
    filters?: CampaignListFilters
  ): Promise<{ data: Campaign[]; total: number }>;
  findAvailablePaginated(
    page: number,
    limit: number,
    filters?: AvailableCampaignFilters
  ): Promise<{ data: Campaign[]; total: number }>;
  findTopByDeliveryCount(limit: number): Promise<CampaignDeliveryStatsItem[]>;
  findById(id: string): Promise<Campaign | null>;
  findByIdWithItems(id: string): Promise<CampaignWithItems | null>;
  createCampaign(data: CreateCampaignDTO): Promise<Campaign>;
  findTypeById(typeId: string): Promise<{ id: string; name: string } | null>;
  findItemByCampaignAndTypeName(
    campaignId: string,
    typeName: string
  ): Promise<ItemCampaign | null>;
  insertItemCampaign(campaignId: string, input: ItemCampaignInput): Promise<ItemCampaign>;
  update(id: string, data: UpdateCampaignDTO): Promise<CampaignWithItems | null>;
  softDelete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
  typeExists(typeId: string): Promise<boolean>;
}
