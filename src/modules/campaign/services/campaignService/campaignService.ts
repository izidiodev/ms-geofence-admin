import { ICampaignRepository } from '@campaign/repositories/campaignRepository/ICampaignRepository.js';
import { ICampaignService, AvailableFilters } from './ICampaignService.js';
import {
  Campaign,
  CampaignDeliveryStatsItem,
  CreateCampaignDTO,
  ItemCampaignInput,
  UpdateCampaignDTO,
  ItemCampaign,
  ItemCampaignResponse,
  CampaignSummaryResponse,
  CampaignDetailResponse,
  PaginatedCampaignsResult,
} from '@campaign/models/campaign.js';
import { CampaignListFilters } from '@campaign/repositories/campaignRepository/ICampaignRepository.js';

function toItemResponse(i: ItemCampaign): ItemCampaignResponse {
  return {
    id: i.id,
    title: i.title,
    description: i.description,
    type_id: i.type_id,
    lat: i.lat,
    long: i.long,
    radius: i.radius,
    created_at: i.created_at,
    updated_at: i.updated_at,
  };
}

function toSummary(c: Campaign): CampaignSummaryResponse {
  return {
    id: c.id,
    name: c.name,
    exp_date: c.exp_date,
    city_uf: c.city_uf,
    enabled: c.enabled,
    created_at: c.created_at,
    updated_at: c.updated_at,
    is_deleted: c.is_deleted,
    delivery_count: c.delivery_count ?? 0,
  };
}

const GEOFENCE_TYPES = ['enter', 'dwell', 'exit'] as const;

function itemsToEnterDwellExitOptional(
  items: Array<ItemCampaign & { type_name: string }>
): Pick<CampaignDetailResponse, 'enter' | 'dwell' | 'exit'> {
  const byType: Record<string, ItemCampaignResponse> = {};
  for (const row of items) {
    byType[row.type_name] = toItemResponse(row);
  }
  return {
    enter: byType['enter'] ?? null,
    dwell: byType['dwell'] ?? null,
    exit: byType['exit'] ?? null,
  };
}

export class CampaignService implements ICampaignService {
  constructor(private readonly repository: ICampaignRepository) {}

  async findAll(
    page: number,
    limit: number,
    filters?: CampaignListFilters
  ): Promise<PaginatedCampaignsResult> {
    const { data, total } = await this.repository.findAllPaginated(page, limit, filters);
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      items: data.map(toSummary),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findAvailable(
    page: number,
    limit: number,
    filters?: AvailableFilters
  ): Promise<PaginatedCampaignsResult> {
    const { data, total } = await this.repository.findAvailablePaginated(page, limit, {
      search: filters?.search,
      search_in: filters?.search_in,
      is_deleted: filters?.is_deleted,
      enabled: filters?.enabled,
      onlyActive: true,
    });
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      items: data.map(toSummary),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getTopDeliveryStats(limit = 10): Promise<CampaignDeliveryStatsItem[]> {
    const capped = Math.min(10, Math.max(1, limit));
    return this.repository.findTopByDeliveryCount(capped);
  }

  async findById(id: string): Promise<CampaignDetailResponse> {
    const row = await this.repository.findByIdWithItems(id);
    if (!row) {
      throw new Error('Campanha não encontrada');
    }
    const { enter, dwell, exit } = itemsToEnterDwellExitOptional(row.items);
    return { ...toSummary(row.campaign), enter, dwell, exit };
  }

  async create(data: CreateCampaignDTO): Promise<CampaignSummaryResponse> {
    const created = await this.repository.createCampaign(data);
    return toSummary(created);
  }

  async addCampaignItem(
    campaignId: string,
    input: ItemCampaignInput
  ): Promise<ItemCampaignResponse> {
    const campaign = await this.repository.findById(campaignId);
    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }
    const typeRow = await this.repository.findTypeById(input.type_id);
    if (!typeRow) {
      throw new Error('Tipo não encontrado');
    }
    if (!GEOFENCE_TYPES.includes(typeRow.name as (typeof GEOFENCE_TYPES)[number])) {
      throw new Error('type_id deve ser do tipo enter, dwell ou exit');
    }
    const existing = await this.repository.findItemByCampaignAndTypeName(
      campaignId,
      typeRow.name
    );
    if (existing) {
      throw new Error('Já existe item deste tipo para esta campanha');
    }
    const item = await this.repository.insertItemCampaign(campaignId, input);
    return toItemResponse(item);
  }

  async update(id: string, data: UpdateCampaignDTO): Promise<CampaignDetailResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Campanha não encontrada');
    }
    for (const partial of [data.enter, data.dwell, data.exit]) {
      if (partial?.type_id && !(await this.repository.typeExists(partial.type_id))) {
        throw new Error('Tipo não encontrado');
      }
    }
    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new Error('Falha ao atualizar campanha');
    }
    const { enter, dwell, exit } = itemsToEnterDwellExitOptional(updated.items);
    return { ...toSummary(updated.campaign), enter, dwell, exit };
  }

  async softDelete(id: string): Promise<void> {
    const exists = await this.repository.existsById(id);
    if (!exists) {
      throw new Error('Campanha não encontrada');
    }
    const deleted = await this.repository.softDelete(id);
    if (!deleted) {
      throw new Error('Falha ao excluir campanha');
    }
  }
}
