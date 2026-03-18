import {
  CreateCampaignDTO,
  ItemCampaignInput,
  UpdateCampaignDTO,
  CampaignSummaryResponse,
  CampaignDetailResponse,
  CampaignDeliveryStatsItem,
  ItemCampaignResponse,
  PaginatedCampaignsResult,
} from '@campaign/models/campaign.js';
import { CampaignListFilters } from '@campaign/repositories/campaignRepository/ICampaignRepository.js';

export interface AvailableFilters {
  search?: string;
  search_in?: 'name' | 'city_uf' | 'both';
  is_deleted?: boolean;
  enabled?: boolean;
}

export interface ICampaignService {
  findAll(
    page: number,
    limit: number,
    filters?: CampaignListFilters
  ): Promise<PaginatedCampaignsResult>;
  findAvailable(
    page: number,
    limit: number,
    filters?: AvailableFilters
  ): Promise<PaginatedCampaignsResult>;
  getTopDeliveryStats(limit?: number): Promise<CampaignDeliveryStatsItem[]>;
  findById(id: string): Promise<CampaignDetailResponse>;
  create(data: CreateCampaignDTO): Promise<CampaignSummaryResponse>;
  addCampaignItem(campaignId: string, input: ItemCampaignInput): Promise<ItemCampaignResponse>;
  update(id: string, data: UpdateCampaignDTO): Promise<CampaignDetailResponse>;
  softDelete(id: string): Promise<void>;
}
