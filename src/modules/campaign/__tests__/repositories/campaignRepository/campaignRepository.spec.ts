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

  describe('findAvailablePaginated com search (nome ou city_uf)', () => {
    it('deve chamar setParameters com searchTerm quando filter.search for informado', async () => {
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
      await repo.findAvailablePaginated(1, 10, { search: 'Barreiras', onlyActive: true });

      expect(setParameters).toHaveBeenCalled();
      const params = setParameters.mock.calls[0][0];
      expect(params).toHaveProperty('searchTerm', '%Barreiras%');
      expect(getManyAndCount).toHaveBeenCalled();
    });

    it('deve incluir condição de search na query (andWhere com ILIKE em name e city_uf)', async () => {
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
      await repo.findAvailablePaginated(1, 10, { search: 'Barreiras', onlyActive: true });

      const searchCondition = andWhereCalls.find(
        (c) => c.includes('searchTerm') && (c.includes('name') || c.includes('city_uf'))
      );
      expect(searchCondition).toBeDefined();
      expect(searchCondition).toMatch(/unaccent.*ILIKE.*searchTerm/);
      expect(searchCondition).toMatch(/city_uf|name/);
    });
  });
});
