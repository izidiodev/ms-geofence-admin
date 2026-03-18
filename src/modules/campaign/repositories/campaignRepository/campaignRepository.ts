import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import {
  Campaign,
  CampaignDeliveryStatsItem,
  CreateCampaignDTO,
  ItemCampaign,
  ItemCampaignInput,
  UpdateCampaignDTO,
} from '@campaign/models/campaign.js';
import {
  CampaignEntity,
  ItemCampaignEntity,
} from '@campaign/entities/campaign.entity.js';
import { AppDataSource } from '@shared/infra/database/data-source.js';
import { TypeEntity } from '@type/entities/type.entity.js';
import {
  ICampaignRepository,
  CampaignListFilters,
  AvailableCampaignFilters,
  SearchInFilter,
  CampaignWithItems,
} from './ICampaignRepository.js';

function toCampaign(e: CampaignEntity, deliveryCountOverride?: number): Campaign {
  const delivery_count =
    deliveryCountOverride !== undefined
      ? deliveryCountOverride
      : (e.delivery_count ?? 0);
  return {
    id: e.id,
    name: e.name,
    exp_date: e.exp_date,
    city_uf: e.city_uf,
    enabled: e.enabled,
    created_at: e.created_at,
    updated_at: e.updated_at,
    is_deleted: e.is_deleted,
    delivery_count,
  };
}

function toItem(
  e: ItemCampaignEntity,
  typeName: string
): ItemCampaign & { type_name: string } {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    type_id: e.type_id,
    lat: e.lat,
    long: e.long,
    radius: e.radius,
    campaign_id: e.campaign_id,
    created_at: e.created_at,
    updated_at: e.updated_at,
    type_name: typeName,
  };
}

export class CampaignRepository implements ICampaignRepository {
  private repository: Repository<CampaignEntity>;
  private itemRepository: Repository<ItemCampaignEntity>;
  private typeRepository: Repository<TypeEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(CampaignEntity);
    this.itemRepository = AppDataSource.getRepository(ItemCampaignEntity);
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
      return { data: data.map(toCampaign), total };
    }

    const where: Record<string, unknown> = {};
    if (filters?.is_deleted !== undefined) where.is_deleted = filters.is_deleted;
    if (filters?.enabled !== undefined) where.enabled = filters.enabled;

    const [entities, total] = await this.repository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip,
      take: limit,
    });
    return { data: entities.map(toCampaign), total };
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
    /**
     * /available: cidade deve bater exatamente com city_uf (normalizado), para não
     * devolver geofences de São Paulo quando o app pede São Bernardo, etc.
     */
    if (filters?.search && filters.search.trim()) {
      params.searchRaw = filters.search.trim();
      qb.andWhere(
        "lower(trim(unaccent(COALESCE(campaign.city_uf, '')))) = lower(trim(unaccent(:searchRaw)))"
      );
      qb.andWhere('campaign.city_uf IS NOT NULL');
    }

    qb.setParameters(params);

    const [entities, total] = await qb.getManyAndCount();

    if (entities.length > 0) {
      const ids = entities.map((e) => e.id);
      await this.repository.query(
        `UPDATE campaigns SET delivery_count = delivery_count + 1 WHERE id = ANY($1::uuid[])`,
        [ids]
      );
    }

    const data = entities.map((e) =>
      toCampaign(e, (e.delivery_count ?? 0) + 1)
    );
    return { data, total };
  }

  async findTopByDeliveryCount(limit: number): Promise<CampaignDeliveryStatsItem[]> {
    const rows = await this.repository
      .createQueryBuilder('campaign')
      .select(['campaign.id', 'campaign.name', 'campaign.delivery_count'])
      .where('campaign.is_deleted = :is_deleted', { is_deleted: false })
      .orderBy('campaign.delivery_count', 'DESC')
      .take(limit)
      .getMany();
    return rows.map((e) => ({
      id: e.id,
      name: e.name,
      delivery_count: e.delivery_count ?? 0,
    }));
  }

  async findById(id: string): Promise<Campaign | null> {
    const e = await this.repository.findOneBy({ id });
    return e ? toCampaign(e) : null;
  }

  async findByIdWithItems(id: string): Promise<CampaignWithItems | null> {
    const campaign = await this.repository.findOneBy({ id });
    if (!campaign) return null;
    const items = await this.itemRepository.find({
      where: { campaign_id: id },
      relations: ['type'],
    });
    const mapped = items.map((row) =>
      toItem(row, (row as ItemCampaignEntity & { type?: { name: string } }).type?.name ?? '')
    );
    return { campaign: toCampaign(campaign), items: mapped };
  }

  async createCampaign(data: CreateCampaignDTO): Promise<Campaign> {
    const campaignId = randomUUID();
    const expDate = data.exp_date ? new Date(data.exp_date) : null;
    const cityUf = data.city_uf?.trim() ?? null;
    await this.repository.insert({
      id: campaignId,
      name: data.name.trim(),
      exp_date: expDate,
      city_uf: cityUf,
      enabled: data.enabled ?? true,
      is_deleted: false,
      delivery_count: 0,
    });
    const created = await this.findById(campaignId);
    if (!created) throw new Error('Falha ao criar campanha');
    return created;
  }

  async findTypeById(typeId: string): Promise<{ id: string; name: string } | null> {
    const t = await this.typeRepository.findOneBy({ id: typeId });
    return t ? { id: t.id, name: t.name } : null;
  }

  async findItemByCampaignAndTypeName(
    campaignId: string,
    typeName: string
  ): Promise<ItemCampaign | null> {
    const row = await this.itemRepository
      .createQueryBuilder('ic')
      .innerJoin('ic.type', 't')
      .where('ic.campaign_id = :cid', { cid: campaignId })
      .andWhere('t.name = :tn', { tn: typeName })
      .getOne();
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type_id: row.type_id,
      lat: row.lat,
      long: row.long,
      radius: row.radius,
      campaign_id: row.campaign_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async insertItemCampaign(campaignId: string, input: ItemCampaignInput): Promise<ItemCampaign> {
    const itemId = randomUUID();
    await this.itemRepository.insert({
      id: itemId,
      title: input.title.trim(),
      description: input.description?.trim() ?? null,
      type_id: input.type_id,
      lat: String(input.lat),
      long: String(input.long),
      radius: input.radius,
      campaign_id: campaignId,
    });
    const e = await this.itemRepository.findOneBy({ id: itemId });
    if (!e) throw new Error('Falha ao criar item da campanha');
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      type_id: e.type_id,
      lat: e.lat,
      long: e.long,
      radius: e.radius,
      campaign_id: e.campaign_id,
      created_at: e.created_at,
      updated_at: e.updated_at,
    };
  }

  async update(id: string, data: UpdateCampaignDTO): Promise<CampaignWithItems | null> {
    const campaign = await this.repository.findOneBy({ id });
    if (!campaign) return null;

    const campUpdate: Partial<CampaignEntity> = {};
    if (data.name !== undefined) campUpdate.name = data.name.trim();
    if (data.exp_date !== undefined) {
      campUpdate.exp_date = data.exp_date ? new Date(data.exp_date) : null;
    }
    if (data.city_uf !== undefined) campUpdate.city_uf = data.city_uf?.trim() ?? null;
    if (data.enabled !== undefined) campUpdate.enabled = data.enabled;
    if (Object.keys(campUpdate).length > 0) {
      await this.repository.update(id, campUpdate);
    }

    const items = await this.itemRepository.find({
      where: { campaign_id: id },
      relations: ['type'],
    });
    const byTypeName = new Map(
      items.map((i) => [
        (i as ItemCampaignEntity & { type?: { name: string } }).type?.name ?? '',
        i,
      ])
    );

    const applyItem = async (
      typeName: 'enter' | 'dwell' | 'exit',
      partial: NonNullable<UpdateCampaignDTO['enter']>
    ) => {
      const item = byTypeName.get(typeName);
      if (!item) return;
      const u: Partial<ItemCampaignEntity> = {};
      if (partial.title !== undefined) u.title = partial.title.trim();
      if (partial.description !== undefined) u.description = partial.description?.trim() ?? null;
      if (partial.type_id !== undefined) u.type_id = partial.type_id;
      if (partial.lat !== undefined) u.lat = String(partial.lat);
      if (partial.long !== undefined) u.long = String(partial.long);
      if (partial.radius !== undefined) u.radius = partial.radius;
      if (Object.keys(u).length > 0) {
        await this.itemRepository.update(item.id, u);
      }
    };

    if (data.enter) await applyItem('enter', data.enter);
    if (data.dwell) await applyItem('dwell', data.dwell);
    if (data.exit) await applyItem('exit', data.exit);

    return this.findByIdWithItems(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { is_deleted: true });
    return (result.affected ?? 0) > 0;
  }

  async existsById(id: string): Promise<boolean> {
    return (await this.repository.countBy({ id })) > 0;
  }

  async typeExists(typeId: string): Promise<boolean> {
    return (await this.typeRepository.countBy({ id: typeId })) > 0;
  }
}
