import { CampaignService } from '@campaign/services/campaignService/campaignService.js';
import { ICampaignRepository } from '@campaign/repositories/campaignRepository/ICampaignRepository.js';
import { Campaign } from '@campaign/models/campaign.js';

const mockCampaign: Campaign = {
  id: 'camp-id-123',
  name: 'Test Campaign',
  description: null,
  exp_date: null,
  city_uf: 'SP',
  type_id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d',
  campaign_group_id: null,
  enabled: true,
  lat: '-23.55',
  long: '-46.63',
  radius: 500,
  created_at: new Date(),
  updated_at: new Date(),
  is_deleted: false,
};

function createMockRepository(): jest.Mocked<ICampaignRepository> {
  return {
    findAllPaginated: jest.fn(),
    findAvailablePaginated: jest.fn(),
    findById: jest.fn(),
    findByGroupId: jest.fn(),
    create: jest.fn(),
    createTriplet: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    existsById: jest.fn(),
    typeExists: jest.fn(),
  };
}

describe('CampaignService', () => {
  let service: CampaignService;
  let mockRepository: jest.Mocked<ICampaignRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new CampaignService(mockRepository);
  });

  describe('findAll', () => {
    it('should return paginated campaigns', async () => {
      mockRepository.findAllPaginated.mockResolvedValue({
        data: [mockCampaign],
        total: 1,
      });

      const result = await service.findAll(1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.items[0].name).toBe('Test Campaign');
      expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('should pass filters to repository', async () => {
      mockRepository.findAllPaginated.mockResolvedValue({ data: [], total: 0 });

      await service.findAll(2, 20, {
        search: 'summer',
        is_deleted: false,
        enabled: true,
      });

      expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(2, 20, {
        search: 'summer',
        is_deleted: false,
        enabled: true,
      });
    });
  });

  describe('findAvailable', () => {
    it('should return available campaigns', async () => {
      mockRepository.findAvailablePaginated.mockResolvedValue({
        data: [mockCampaign],
        total: 1,
      });

      const result = await service.findAvailable(1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockRepository.findAvailablePaginated).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({ onlyActive: true })
      );
    });

    it('should pass search filter to repository (busca por nome ou city_uf)', async () => {
      const campaignBarreiras = {
        ...mockCampaign,
        id: 'camp-barreiras',
        name: 'Promo Barreiras',
        city_uf: 'Barreiras',
      };
      mockRepository.findAvailablePaginated.mockResolvedValue({
        data: [campaignBarreiras],
        total: 1,
      });

      const result = await service.findAvailable(1, 10, { search: 'Barreiras' });

      expect(mockRepository.findAvailablePaginated).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          onlyActive: true,
          search: 'Barreiras',
        })
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0].city_uf).toBe('Barreiras');
      expect(result.items[0].name).toBe('Promo Barreiras');
    });

    it('should pass optional filters (is_deleted, enabled) to repository', async () => {
      mockRepository.findAvailablePaginated.mockResolvedValue({ data: [], total: 0 });

      await service.findAvailable(1, 10, {
        search: 'Barreiras',
        is_deleted: false,
        enabled: true,
      });

      expect(mockRepository.findAvailablePaginated).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          search: 'Barreiras',
          is_deleted: false,
          enabled: true,
          onlyActive: true,
        })
      );
    });
  });

  describe('findById', () => {
    it('should return campaign when found', async () => {
      mockRepository.findById.mockResolvedValue(mockCampaign);

      const result = await service.findById('camp-id-123');

      expect(result.id).toBe('camp-id-123');
      expect(result.name).toBe('Test Campaign');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw when campaign not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        'Campanha não encontrada'
      );
    });
  });

  describe('createTriplet', () => {
    const tripletPayload = {
      enter: {
        name: 'New Campaign Enter',
        type_id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d',
        lat: -23.55,
        long: -46.63,
        radius: 500,
      },
      dwell: {
        name: 'New Campaign Dwell',
        type_id: 'b2c3d4e5-f6a7-5b1c-9d2e-3f4a5b6c7d8e',
        lat: -23.55,
        long: -46.63,
        radius: 500,
      },
      exit: {
        name: 'New Campaign Exit',
        type_id: 'c3d4e5f6-a7b8-4c2d-8e3f-4a5b6c7d8e9f',
        lat: -23.55,
        long: -46.63,
        radius: 500,
      },
    };

    it('should create triplet when types exist', async () => {
      mockRepository.typeExists.mockResolvedValue(true);
      const enterCamp = { ...mockCampaign, id: 'enter-id', name: 'Enter' };
      const dwellCamp = { ...mockCampaign, id: 'dwell-id', name: 'Dwell' };
      const exitCamp = { ...mockCampaign, id: 'exit-id', name: 'Exit' };
      mockRepository.createTriplet.mockResolvedValue({
        enter: enterCamp,
        dwell: dwellCamp,
        exit: exitCamp,
      });

      const result = await service.createTriplet(tripletPayload);

      expect(result.campaign_group_id).toBeDefined();
      expect(result.enter.name).toBe('Enter');
      expect(result.dwell.name).toBe('Dwell');
      expect(result.exit.name).toBe('Exit');
      expect(mockRepository.typeExists).toHaveBeenCalledTimes(3);
      expect(mockRepository.createTriplet).toHaveBeenCalledWith(
        result.campaign_group_id,
        tripletPayload
      );
    });

    it('should throw when type does not exist', async () => {
      mockRepository.typeExists.mockResolvedValue(false);

      await expect(service.createTriplet(tripletPayload)).rejects.toThrow(
        'Tipo não encontrado'
      );

      expect(mockRepository.createTriplet).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update campaign when found', async () => {
      const updated = { ...mockCampaign, name: 'Updated Name' };
      mockRepository.findById.mockResolvedValue(mockCampaign);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.update('camp-id-123', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(mockRepository.update).toHaveBeenCalledWith('camp-id-123', {
        name: 'Updated Name',
      });
    });

    it('should throw when campaign not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Updated' })
      ).rejects.toThrow('Campanha não encontrada');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should soft delete when campaign exists', async () => {
      mockRepository.existsById.mockResolvedValue(true);
      mockRepository.softDelete.mockResolvedValue(true);

      await service.softDelete('camp-id-123');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('camp-id-123');
    });

    it('should throw when campaign not found', async () => {
      mockRepository.existsById.mockResolvedValue(false);

      await expect(service.softDelete('non-existent')).rejects.toThrow(
        'Campanha não encontrada'
      );

      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
