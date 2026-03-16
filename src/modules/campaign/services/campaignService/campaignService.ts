import { randomUUID } from 'crypto';
import { ICampaignRepository } from '@campaign/repositories/campaignRepository/ICampaignRepository.js';
import { ICampaignService, AvailableFilters } from './ICampaignService.js';
import {
  Campaign,
  CreateCampaignDTO,
  CreateCampaignTripletDTO,
  CreateCampaignTripletResponse,
  UpdateCampaignDTO,
  CampaignResponse,
  PaginatedCampaignsResult,
} from '@campaign/models/campaign.js';
import { CampaignListFilters } from '@campaign/repositories/campaignRepository/ICampaignRepository.js';

export class CampaignService implements ICampaignService {
  constructor(private readonly repository: ICampaignRepository) {}

  private toResponse(c: Campaign): CampaignResponse {
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      exp_date: c.exp_date,
      city_uf: c.city_uf,
      type_id: c.type_id,
      campaign_group_id: c.campaign_group_id ?? null,
      enabled: c.enabled,
      lat: c.lat,
      long: c.long,
      radius: c.radius,
      created_at: c.created_at,
      updated_at: c.updated_at,
      is_deleted: c.is_deleted,
    };
  }

  async findAll(
    page: number,
    limit: number,
    filters?: CampaignListFilters
  ): Promise<PaginatedCampaignsResult> {
    const { data, total } = await this.repository.findAllPaginated(
      page,
      limit,
      filters
    );
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      items: data.map(this.toResponse),
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
    const repoFilters = {
      search: filters?.search,
      is_deleted: filters?.is_deleted,
      enabled: filters?.enabled,
      onlyActive: true,
    };
    const { data, total } = await this.repository.findAvailablePaginated(
      page,
      limit,
      repoFilters
    );
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      items: data.map(this.toResponse),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<CampaignResponse> {
    const campaign = await this.repository.findById(id);
    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }
    return this.toResponse(campaign);
  }

  async createTriplet(
    data: CreateCampaignTripletDTO
  ): Promise<CreateCampaignTripletResponse> {
    for (const payload of [data.enter, data.dwell, data.exit]) {
      const typeExists = await this.repository.typeExists(payload.type_id);
      if (!typeExists) {
        throw new Error('Tipo não encontrado');
      }
    }
    const campaignGroupId = randomUUID();
    const { enter, dwell, exit } = await this.repository.createTriplet(
      campaignGroupId,
      data
    );
    return {
      campaign_group_id: campaignGroupId,
      enter: this.toResponse(enter),
      dwell: this.toResponse(dwell),
      exit: this.toResponse(exit),
    };
  }

  async createSingle(data: CreateCampaignDTO): Promise<CampaignResponse> {
    const typeExists = await this.repository.typeExists(data.type_id);
    if (!typeExists) {
      throw new Error('Tipo não encontrado');
    }
    const id = randomUUID();
    const campaign = await this.repository.create(id, data, null);
    return this.toResponse(campaign);
  }

  async findByGroupId(
    campaignGroupId: string
  ): Promise<{ enter: CampaignResponse; dwell: CampaignResponse; exit: CampaignResponse }> {
    const list = await this.repository.findByGroupId(campaignGroupId);
    if (list.length === 0) {
      throw new Error('Grupo de campanhas não encontrado');
    }
    const byType: Record<string, CampaignResponse> = {};
    for (const c of list) {
      const name = (c as Campaign & { type_name: string }).type_name;
      byType[name] = this.toResponse(c);
    }
    const enter = byType['enter'];
    const dwell = byType['dwell'];
    const exit = byType['exit'];
    if (!enter || !dwell || !exit) {
      throw new Error('Grupo de campanhas incompleto (enter, dwell ou exit ausente)');
    }
    return { enter, dwell, exit };
  }

  async update(id: string, data: UpdateCampaignDTO): Promise<CampaignResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Campanha não encontrada');
    }
    if (data.type_id) {
      const typeExists = await this.repository.typeExists(data.type_id);
      if (!typeExists) {
        throw new Error('Tipo não encontrado');
      }
    }
    const campaign = await this.repository.update(id, data);
    if (!campaign) {
      throw new Error('Falha ao atualizar campanha');
    }
    return this.toResponse(campaign);
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
