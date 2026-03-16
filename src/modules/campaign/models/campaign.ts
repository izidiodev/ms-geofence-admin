export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  exp_date: Date | null;
  city_uf: string | null;
  type_id: string;
  campaign_group_id: string | null;
  enabled: boolean;
  lat: string;
  long: string;
  radius: number;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

/** Payload para criar as 3 campanhas (enter, dwell, exit) vinculadas por campaign_group_id */
export interface CreateCampaignTripletDTO {
  enter: CreateCampaignDTO;
  dwell: CreateCampaignDTO;
  exit: CreateCampaignDTO;
}

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  exp_date?: string;
  city_uf?: string;
  type_id: string;
  enabled?: boolean;
  lat: number;
  long: number;
  radius: number;
}

export interface UpdateCampaignDTO {
  name?: string;
  description?: string;
  exp_date?: string;
  city_uf?: string;
  type_id?: string;
  enabled?: boolean;
  lat?: number;
  long?: number;
  radius?: number;
}

export interface CampaignResponse {
  id: string;
  name: string;
  description: string | null;
  exp_date: Date | null;
  city_uf: string | null;
  type_id: string;
  campaign_group_id: string | null;
  enabled: boolean;
  lat: string;
  long: string;
  radius: number;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

/** Resposta da criação em trio: grupo + as 3 campanhas */
export interface CreateCampaignTripletResponse {
  campaign_group_id: string;
  enter: CampaignResponse;
  dwell: CampaignResponse;
  exit: CampaignResponse;
}

export interface PaginatedCampaignsResult {
  items: CampaignResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
