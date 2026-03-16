import {
  Campaign,
  CreateCampaignDTO,
  CreateCampaignTripletDTO,
  UpdateCampaignDTO,
} from '@campaign/models/campaign.js';

export type SearchInFilter = 'name' | 'city_uf' | 'both';

export interface CampaignListFilters {
  search?: string;
  search_in?: SearchInFilter; // default 'both': busca em name e city_uf; 'city_uf' só cidade/UF; 'name' só nome
  is_deleted?: boolean;
  enabled?: boolean;
}

export interface AvailableCampaignFilters {
  search?: string;
  search_in?: SearchInFilter;
  is_deleted?: boolean;
  enabled?: boolean;
  onlyActive?: boolean; // default true: enabled, !is_deleted, exp_date >= today
}

export interface PaginatedCampaignRepositoryResult {
  data: Campaign[];
  total: number;
}

export interface ICampaignRepository {
  findAllPaginated(
    page: number,
    limit: number,
    filters?: CampaignListFilters
  ): Promise<PaginatedCampaignRepositoryResult>;
  findAvailablePaginated(
    page: number,
    limit: number,
    filters?: AvailableCampaignFilters
  ): Promise<PaginatedCampaignRepositoryResult>;
  findById(id: string): Promise<Campaign | null>;
  findByGroupId(campaignGroupId: string): Promise<Array<Campaign & { type_name: string }>>;
  create(id: string, data: CreateCampaignDTO, campaignGroupId?: string | null): Promise<Campaign>;
  createTriplet(
    campaignGroupId: string,
    data: CreateCampaignTripletDTO
  ): Promise<{ enter: Campaign; dwell: Campaign; exit: Campaign }>;
  update(id: string, data: UpdateCampaignDTO): Promise<Campaign | null>;
  softDelete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
  typeExists(typeId: string): Promise<boolean>;
}
