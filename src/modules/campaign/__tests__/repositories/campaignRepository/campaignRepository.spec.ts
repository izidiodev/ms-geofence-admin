import { CampaignRepository } from '@campaign/repositories/campaignRepository/campaignRepository.js';
import { AppDataSource } from '@shared/infra/database/data-source.js';
import { CampaignEntity } from '@campaign/entities/campaign.entity.js';
import { TypeEntity } from '@type/entities/type.entity.js';

describe('CampaignRepository', () => {
  let getRepositorySpy: jest.SpyInstance;

  beforeEach(() => {
    getRepositorySpy = jest.spyOn(AppDataSource, 'getRepository');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findAvailablePaginated — search = city_uf exato', () => {
    it('deve usar searchRaw com valor literal (igualdade em city_uf)', async () => {
      const setParameters = jest.fn();
      const getManyAndCount = jest.fn().mockResolvedValue([[], 0]);

      const mockQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        setParameters,
        getManyAndCount,
      };

      const mockRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      };
      const mockTypeRepository = { countBy: jest.fn() };

      getRepositorySpy.mockImplementation((entity: unknown) => {
        if (entity === CampaignEntity) return mockRepository as never;
        if (entity === TypeEntity) return mockTypeRepository as never;
        return mockRepository as never;
      });

      const repo = new CampaignRepository();
      await repo.findAvailablePaginated(1, 10, {
        search: 'São Paulo/SP',
        onlyActive: true,
      });

      expect(setParameters).toHaveBeenCalled();
      const params = setParameters.mock.calls[0][0];
      expect(params).toHaveProperty('searchRaw', 'São Paulo/SP');
      expect(getManyAndCount).toHaveBeenCalled();
    });

    it('deve aplicar igualdade normalizada em city_uf e exigir city_uf preenchido', async () => {
      const andWhereCalls: string[] = [];
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn((condition: string) => {
          andWhereCalls.push(condition);
          return mockQb;
        }),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      const mockRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      };
      const mockTypeRepository = { countBy: jest.fn() };

      getRepositorySpy.mockImplementation((entity: unknown) => {
        if (entity === CampaignEntity) return mockRepository as never;
        if (entity === TypeEntity) return mockTypeRepository as never;
        return mockRepository as never;
      });

      const repo = new CampaignRepository();
      await repo.findAvailablePaginated(1, 10, { search: 'São Bernardo/SP', onlyActive: true });

      expect(andWhereCalls.some((c) => c.includes('searchRaw') && c.includes('='))).toBe(true);
      expect(andWhereCalls.some((c) => c.includes('city_uf IS NOT NULL'))).toBe(true);
    });
  });

  describe('findAvailablePaginated — delivery_count', () => {
    it('deve incrementar delivery_count no banco e retornar valor já atualizado na resposta', async () => {
      const campaignEntity = {
        id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d',
        name: 'Camp',
        exp_date: null,
        city_uf: 'SP',
        enabled: true,
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        delivery_count: 10,
      };

      const query = jest.fn().mockResolvedValue(undefined);
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[campaignEntity], 1]),
      };

      const mockRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQb),
        query,
      };
      const mockTypeRepository = { countBy: jest.fn() };

      getRepositorySpy.mockImplementation((entity: unknown) => {
        if (entity === CampaignEntity) return mockRepository as never;
        if (entity === TypeEntity) return mockTypeRepository as never;
        return mockRepository as never;
      });

      const repo = new CampaignRepository();
      const { data } = await repo.findAvailablePaginated(1, 10, { onlyActive: true });

      expect(query).toHaveBeenCalledWith(
        expect.stringMatching(/delivery_count\s*=\s*delivery_count\s*\+\s*1/),
        [['a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d']]
      );
      expect(data).toHaveLength(1);
      expect(data[0].delivery_count).toBe(11);
    });
  });
});
