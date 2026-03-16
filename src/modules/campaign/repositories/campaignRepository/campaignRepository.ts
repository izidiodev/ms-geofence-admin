import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import {
  Campaign,
  CreateCampaignDTO,
  CreateCampaignTripletDTO,
  UpdateCampaignDTO,
} from '@campaign/models/campaign.js';
import { CampaignEntity } from '@campaign/entities/campaign.entity.js';
import { AppDataSource } from '@shared/infra/database/data-source.js';
import { TypeEntity } from '@type/entities/type.entity.js';
import {
  ICampaignRepository,
  CampaignListFilters,
  AvailableCampaignFilters,
  SearchInFilter,
} from './ICampaignRepository.js';

export class CampaignRepository implements ICampaignRepository {
  private repository: Repository<CampaignEntity>;
  private typeRepository: Repository<TypeEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(CampaignEntity);
    this.typeRepository = AppDataSource.getRepository(TypeEntity);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    filters?: CampaignListFilters
  ): Promise<{ data: Campaign[]; total: number }> {
    const skip = (page - 1) * limit;

    if (filters?.search && filters.search.trim()) {
      const search = `%${filters.search.trim()}%`;
      const searchIn: SearchInFilter = filters.search_in ?? 'both';
      const nameOnly = searchIn === 'name';
      const cityUfOnly = searchIn === 'city_uf';
      const searchCondition =
        nameOnly
          ? 'unaccent(campaign.name) ILIKE unaccent(:search)'
          : cityUfOnly
            ? 'unaccent(COALESCE(campaign.city_uf, \'\')) ILIKE unaccent(:search)'
            : '(unaccent(campaign.name) ILIKE unaccent(:search) OR unaccent(COALESCE(campaign.city_uf, \'\')) ILIKE unaccent(:search))';
      const qb = this.repository
        .createQueryBuilder('campaign')
        .where(searchCondition, { search })
        .orderBy('campaign.name', 'ASC')
        .skip(skip)
        .take(limit);
      if (filters.is_deleted !== undefined) {
        qb.andWhere('campaign.is_deleted = :is_deleted', {
          is_deleted: filters.is_deleted,
        });
      }
      if (filters.enabled !== undefined) {
        qb.andWhere('campaign.enabled = :enabled', { enabled: filters.enabled });
      }
      const [data, total] = await qb.getManyAndCount();
      return { data, total };
    }

    const where: Record<string, unknown> = {};
    if (filters?.is_deleted !== undefined) where.is_deleted = filters.is_deleted;
    if (filters?.enabled !== undefined) where.enabled = filters.enabled;

    const [data, total] = await this.repository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip,
      take: limit,
    });
    return { data, total };
  }

  async findAvailablePaginated(
    page: number,
    limit: number,
    filters?: AvailableCampaignFilters
  ): Promise<{ data: Campaign[]; total: number }> {
    const skip = (page - 1) * limit;
    const onlyActive = filters?.onlyActive !== false;

    const qb = this.repository
      .createQueryBuilder('campaign')
      .where('1 = 1')
      .orderBy('campaign.name', 'ASC')
      .skip(skip)
      .take(limit);

    const params: Record<string, unknown> = {};

    if (onlyActive) {
      params.today = new Date().toISOString().slice(0, 10);
      qb.andWhere('(campaign.exp_date IS NULL OR campaign.exp_date >= :today)');
      if (filters?.enabled === undefined) {
        params.enabled = true;
        qb.andWhere('campaign.enabled = :enabled');
      }
      if (filters?.is_deleted === undefined) {
        params.is_deleted = false;
        qb.andWhere('campaign.is_deleted = :is_deleted');
      }
    }
    if (filters?.is_deleted !== undefined) {
      params.is_deleted_filter = filters.is_deleted;
      qb.andWhere('campaign.is_deleted = :is_deleted_filter');
    }
    if (filters?.enabled !== undefined) {
      params.enabled_filter = filters.enabled;
      qb.andWhere('campaign.enabled = :enabled_filter');
    }
    if (filters?.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      params.searchTerm = searchTerm;
      const searchIn: SearchInFilter = filters.search_in ?? 'both';
      const nameOnly = searchIn === 'name';
      const cityUfOnly = searchIn === 'city_uf';
      const searchCondition =
        nameOnly
          ? 'unaccent(campaign.name) ILIKE unaccent(:searchTerm)'
          : cityUfOnly
            ? "unaccent(COALESCE(campaign.city_uf, '')) ILIKE unaccent(:searchTerm)"
            : "(unaccent(campaign.name) ILIKE unaccent(:searchTerm) OR unaccent(COALESCE(campaign.city_uf, '')) ILIKE unaccent(:searchTerm))";
      qb.andWhere(searchCondition);
    }

    qb.setParameters(params);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findById(id: string): Promise<Campaign | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByGroupId(
    campaignGroupId: string
  ): Promise<Array<Campaign & { type_name: string }>> {
    const list = await this.repository.find({
      where: { campaign_group_id: campaignGroupId },
      relations: ['type'],
      order: { name: 'ASC' },
    });
    return list.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      exp_date: c.exp_date,
      city_uf: c.city_uf,
      type_id: c.type_id,
      campaign_group_id: c.campaign_group_id,
      enabled: c.enabled,
      lat: c.lat,
      long: c.long,
      radius: c.radius,
      created_at: c.created_at,
      updated_at: c.updated_at,
      is_deleted: c.is_deleted,
      type_name: (c as CampaignEntity & { type?: { name: string } }).type?.name ?? '',
    }));
  }

  async create(
    id: string,
    data: CreateCampaignDTO,
    campaignGroupId?: string | null
  ): Promise<Campaign> {
    const expDate = data.exp_date
      ? new Date(data.exp_date)
      : null;
    const entity = this.repository.create({
      id,
      name: data.name.trim(),
      description: data.description?.trim() ?? null,
      exp_date: expDate,
      city_uf: data.city_uf?.trim() ?? null,
      type_id: data.type_id,
      campaign_group_id: campaignGroupId ?? null,
      enabled: data.enabled ?? true,
      lat: String(data.lat),
      long: String(data.long),
      radius: data.radius,
      is_deleted: false,
    });
    return await this.repository.save(entity);
  }

  async createTriplet(
    campaignGroupId: string,
    data: CreateCampaignTripletDTO
  ): Promise<{ enter: Campaign; dwell: Campaign; exit: Campaign }> {
    const idEnter = randomUUID();
    const idDwell = randomUUID();
    const idExit = randomUUID();
    const [enter, dwell, exit] = await Promise.all([
      this.create(idEnter, data.enter, campaignGroupId),
      this.create(idDwell, data.dwell, campaignGroupId),
      this.create(idExit, data.exit, campaignGroupId),
    ]);
    return { enter, dwell, exit };
  }

  async update(id: string, data: UpdateCampaignDTO): Promise<Campaign | null> {
    const campaign = await this.repository.findOneBy({ id });
    if (!campaign) return null;

    const updated: Partial<CampaignEntity> = {};
    if (data.name !== undefined) updated.name = data.name.trim();
    if (data.description !== undefined)
      updated.description = data.description?.trim() ?? null;
    if (data.exp_date !== undefined)
      updated.exp_date = data.exp_date ? new Date(data.exp_date) : null;
    if (data.city_uf !== undefined) updated.city_uf = data.city_uf?.trim() ?? null;
    if (data.type_id !== undefined) updated.type_id = data.type_id;
    if (data.enabled !== undefined) updated.enabled = data.enabled;
    if (data.lat !== undefined) updated.lat = String(data.lat);
    if (data.long !== undefined) updated.long = String(data.long);
    if (data.radius !== undefined) updated.radius = data.radius;

    await this.repository.update(id, updated);
    return await this.repository.findOneBy({ id });
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { is_deleted: true });
    return (result.affected ?? 0) > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.repository.countBy({ id });
    return count > 0;
  }

  async typeExists(typeId: string): Promise<boolean> {
    const count = await this.typeRepository.countBy({ id: typeId });
    return count > 0;
  }
}
