/** Dados da campanha (geofence agregada) */
export interface Campaign {
  id: string;
  name: string;
  exp_date: Date | null;
  city_uf: string | null;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  /** Vezes que a campanha foi retornada no endpoint público /available */
  delivery_count: number;
}

export interface ItemCampaign {
  id: string;
  title: string;
  description: string | null;
  type_id: string;
  lat: string;
  long: string;
  radius: number;
  campaign_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ItemCampaignInput {
  title: string;
  description?: string;
  type_id: string;
  lat: number;
  long: number;
  radius: number;
}

/** Body POST: apenas dados da campanha (itens em POST /campaigns/:id/items) */
export interface CreateCampaignDTO {
  name: string;
  exp_date?: string;
  city_uf?: string;
  enabled?: boolean;
}

export interface ItemCampaignResponse {
  id: string;
  title: string;
  description: string | null;
  type_id: string;
  lat: string;
  long: string;
  radius: number;
  created_at: Date;
  updated_at: Date;
}

/** Lista / resumo */
export interface CampaignSummaryResponse {
  id: string;
  name: string;
  exp_date: Date | null;
  city_uf: string | null;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  delivery_count: number;
}

/** Detalhe: enter/dwell/exit podem ser null até cadastrados */
export interface CampaignDetailResponse extends CampaignSummaryResponse {
  enter: ItemCampaignResponse | null;
  dwell: ItemCampaignResponse | null;
  exit: ItemCampaignResponse | null;
}

export interface UpdateCampaignDTO {
  name?: string;
  exp_date?: string;
  city_uf?: string;
  enabled?: boolean;
  enter?: Partial<ItemCampaignInput>;
  dwell?: Partial<ItemCampaignInput>;
  exit?: Partial<ItemCampaignInput>;
}

export interface PaginatedCampaignsResult {
  items: CampaignSummaryResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Item mínimo para gráfico: top campanhas por delivery_count */
export interface CampaignDeliveryStatsItem {
  id: string;
  name: string;
  delivery_count: number;
}
