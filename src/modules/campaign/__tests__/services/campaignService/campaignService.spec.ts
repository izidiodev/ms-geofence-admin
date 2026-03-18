import { CampaignService } from '@campaign/services/campaignService/campaignService.js';
import { ICampaignRepository } from '@campaign/repositories/campaignRepository/ICampaignRepository.js';
import { Campaign, ItemCampaign } from '@campaign/models/campaign.js';

const mockCampaign: Campaign = {
  id: 'camp-id-123',
  name: 'Test Campaign',
  exp_date: null,
  city_uf: 'SP',
  enabled: true,
  created_at: new Date(),
  updated_at: new Date(),
  is_deleted: false,
  delivery_count: 42,
};

function item(
  typeName: string,
  typeId: string
): ItemCampaign & { type_name: string } {
  return {
    id: `${typeName}-item-id`,
    title: `Title ${typeName}`,
    description: null,
    type_id: typeId,
    lat: '-23.55',
    long: '-46.63',
    radius: 500,
    campaign_id: mockCampaign.id,
    created_at: new Date(),
    updated_at: new Date(),
    type_name: typeName,
  };
}

function createMockRepository(): jest.Mocked<ICampaignRepository> {
  return {
    findAllPaginated: jest.fn(),
    findAvailablePaginated: jest.fn(),
    findTopByDeliveryCount: jest.fn(),
    findById: jest.fn(),
    findByIdWithItems: jest.fn(),
    createCampaign: jest.fn(),
    findTypeById: jest.fn(),
    findItemByCampaignAndTypeName: jest.fn(),
    insertItemCampaign: jest.fn(),
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
      expect(result.items[0].name).toBe('Test Campaign');
      expect(result.items[0]).not.toHaveProperty('enter');
      expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe('getTopDeliveryStats', () => {
    it('should return top campaigns by delivery_count', async () => {
      const items = [
        { id: 'a', name: 'Camp 1', delivery_count: 200 },
        { id: 'b', name: 'Camp 2', delivery_count: 100 },
      ];
      mockRepository.findTopByDeliveryCount.mockResolvedValue(items);

      const result = await service.getTopDeliveryStats(10);

      expect(result).toEqual(items);
      expect(mockRepository.findTopByDeliveryCount).toHaveBeenCalledWith(10);
    });

    it('should cap limit at 10', async () => {
      mockRepository.findTopByDeliveryCount.mockResolvedValue([]);
      await service.getTopDeliveryStats(99);
      expect(mockRepository.findTopByDeliveryCount).toHaveBeenCalledWith(10);
    });
  });

  describe('findAvailable', () => {
    it('should return available campaigns with delivery_count', async () => {
      mockRepository.findAvailablePaginated.mockResolvedValue({
        data: [{ ...mockCampaign, delivery_count: 100 }],
        total: 1,
      });

      const result = await service.findAvailable(1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].delivery_count).toBe(100);
      expect(mockRepository.findAvailablePaginated).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({ onlyActive: true })
      );
    });
  });

  describe('findById', () => {
    it('should return campaign with enter, dwell, exit when all exist', async () => {
      mockRepository.findByIdWithItems.mockResolvedValue({
        campaign: mockCampaign,
        items: [
          item('enter', 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d'),
          item('dwell', 'b2c3d4e5-f6a7-5b1c-9d2e-3f4a5b6c7d8e'),
          item('exit', 'c3d4e5f6-a7b8-4c2d-8e3f-4a5b6c7d8e9f'),
        ],
      });

      const result = await service.findById('camp-id-123');

      expect(result.id).toBe('camp-id-123');
      expect(result.enter?.type_id).toBe('a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d');
      expect(result.dwell?.type_id).toBe('b2c3d4e5-f6a7-5b1c-9d2e-3f4a5b6c7d8e');
      expect(result.exit?.type_id).toBe('c3d4e5f6-a7b8-4c2d-8e3f-4a5b6c7d8e9f');
    });

    it('should return null for missing item slots', async () => {
      mockRepository.findByIdWithItems.mockResolvedValue({
        campaign: mockCampaign,
        items: [item('enter', 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d')],
      });

      const result = await service.findById('camp-id-123');

      expect(result.enter).not.toBeNull();
      expect(result.dwell).toBeNull();
      expect(result.exit).toBeNull();
    });

    it('should throw when campaign not found', async () => {
      mockRepository.findByIdWithItems.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        'Campanha não encontrada'
      );
    });
  });

  describe('create', () => {
    it('should create campaign header only', async () => {
      mockRepository.createCampaign.mockResolvedValue({
        ...mockCampaign,
        id: 'new-id',
        name: 'Nova',
      });

      const result = await service.create({ name: 'Nova' });

      expect(result.id).toBe('new-id');
      expect(result.name).toBe('Nova');
      expect(mockRepository.createCampaign).toHaveBeenCalledWith({ name: 'Nova' });
    });
  });

  describe('addCampaignItem', () => {
    const input = {
      title: 'Entrada',
      type_id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d',
      lat: -23.55,
      long: -46.63,
      radius: 500,
    };

    it('should add item when campaign and type exist', async () => {
      mockRepository.findById.mockResolvedValue(mockCampaign);
      mockRepository.findTypeById.mockResolvedValue({ id: input.type_id, name: 'enter' });
      mockRepository.findItemByCampaignAndTypeName.mockResolvedValue(null);
      mockRepository.insertItemCampaign.mockResolvedValue({
        id: 'item-new',
        title: 'Entrada',
        description: null,
        type_id: input.type_id,
        lat: '-23.55',
        long: '-46.63',
        radius: 500,
        campaign_id: mockCampaign.id,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await service.addCampaignItem(mockCampaign.id, input);

      expect(result.title).toBe('Entrada');
      expect(mockRepository.insertItemCampaign).toHaveBeenCalledWith(mockCampaign.id, input);
    });

    it('should throw when campaign not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.addCampaignItem('x', input)).rejects.toThrow(
        'Campanha não encontrada'
      );
    });

    it('should throw when type not found', async () => {
      mockRepository.findById.mockResolvedValue(mockCampaign);
      mockRepository.findTypeById.mockResolvedValue(null);

      await expect(service.addCampaignItem(mockCampaign.id, input)).rejects.toThrow(
        'Tipo não encontrado'
      );
    });

    it('should throw when type is not enter/dwell/exit', async () => {
      mockRepository.findById.mockResolvedValue(mockCampaign);
      mockRepository.findTypeById.mockResolvedValue({ id: input.type_id, name: 'other' });

      await expect(service.addCampaignItem(mockCampaign.id, input)).rejects.toThrow(
        'type_id deve ser do tipo enter, dwell ou exit'
      );
    });

    it('should throw when duplicate type for campaign', async () => {
      mockRepository.findById.mockResolvedValue(mockCampaign);
      mockRepository.findTypeById.mockResolvedValue({ id: input.type_id, name: 'enter' });
      mockRepository.findItemByCampaignAndTypeName.mockResolvedValue({
        id: 'existing',
        title: 'Old',
        description: null,
        type_id: input.type_id,
        lat: '0',
        long: '0',
        radius: 100,
        campaign_id: mockCampaign.id,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(service.addCampaignItem(mockCampaign.id, input)).rejects.toThrow(
        'Já existe item deste tipo para esta campanha'
      );
    });
  });

  describe('update', () => {
    it('should update campaign when found', async () => {
      mockRepository.findById.mockResolvedValue(mockCampaign);
      mockRepository.update.mockResolvedValue({
        campaign: { ...mockCampaign, name: 'Updated Name' },
        items: [
          item('enter', 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d'),
          item('dwell', 'b2c3d4e5-f6a7-5b1c-9d2e-3f4a5b6c7d8e'),
          item('exit', 'c3d4e5f6-a7b8-4c2d-8e3f-4a5b6c7d8e9f'),
        ],
      });

      const result = await service.update('camp-id-123', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(mockRepository.update).toHaveBeenCalledWith('camp-id-123', {
        name: 'Updated Name',
      });
    });

    it('should throw when campaign not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Updated' })).rejects.toThrow(
        'Campanha não encontrada'
      );

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
  });
});
