import {
  CreateCampaignDTO,
  CreateCampaignTripletDTO,
  CreateCampaignTripletResponse,
  UpdateCampaignDTO,
  CampaignResponse,
  PaginatedCampaignsResult,
} from '@campaign/models/campaign.js';
import {
  CampaignListFilters,
  SearchInFilter,
} from '@campaign/repositories/campaignRepository/ICampaignRepository.js';

export interface AvailableFilters {
  search?: string;
  search_in?: SearchInFilter;
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
  findById(id: string): Promise<CampaignResponse>;
  findByGroupId(
    campaignGroupId: string
  ): Promise<{ enter: CampaignResponse; dwell: CampaignResponse; exit: CampaignResponse }>;
  createTriplet(data: CreateCampaignTripletDTO): Promise<CreateCampaignTripletResponse>;
  createSingle(data: CreateCampaignDTO): Promise<CampaignResponse>;
  update(id: string, data: UpdateCampaignDTO): Promise<CampaignResponse>;
  softDelete(id: string): Promise<void>;
}
