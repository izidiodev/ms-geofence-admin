import { Request, Response } from 'express';
import { CampaignController } from '@campaign/controllers/campaignController/campaignController.js';
import { ICampaignService } from '@campaign/services/campaignService/ICampaignService.js';
import { CampaignDetailResponse } from '@campaign/models/campaign.js';

const item = {
  id: 'item-id',
  title: 'T',
  description: null as string | null,
  type_id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d',
  lat: '-23.55',
  long: '-46.63',
  radius: 500,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockDetail: CampaignDetailResponse = {
  id: 'camp-id-123',
  name: 'Test Campaign',
  exp_date: null,
  city_uf: 'SP',
  enabled: true,
  created_at: new Date(),
  updated_at: new Date(),
  is_deleted: false,
  delivery_count: 0,
  enter: { ...item, type_id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d' },
  dwell: { ...item, id: 'd', type_id: 'b2c3d4e5-f6a7-5b1c-9d2e-3f4a5b6c7d8e' },
  exit: { ...item, id: 'e', type_id: 'c3d4e5f6-a7b8-4c2d-8e3f-4a5b6c7d8e9f' },
};

const mockSummary = {
  id: 'camp-id-123',
  name: 'Test Campaign',
  exp_date: null,
  city_uf: 'SP',
  enabled: true,
  created_at: new Date(),
  updated_at: new Date(),
  is_deleted: false,
  delivery_count: 0,
};

function createMockService(): jest.Mocked<ICampaignService> {
  return {
    findAll: jest.fn(),
    findAvailable: jest.fn(),
    getTopDeliveryStats: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    addCampaignItem: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };
}

function createMockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('CampaignController', () => {
  let controller: CampaignController;
  let mockService: jest.Mocked<ICampaignService>;
  let mockRes: Response;

  beforeEach(() => {
    mockService = createMockService();
    controller = new CampaignController(mockService);
    mockRes = createMockRes();
  });

  describe('findAll', () => {
    it('should call service.findAll and return success', async () => {
      const req = { query: { page: '1', limit: '10' } } as Request;
      mockService.findAll.mockResolvedValue({
        items: [mockSummary],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.findAll(req, mockRes);

      expect(mockService.findAll).toHaveBeenCalledWith(1, 10, {});
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('findAvailable', () => {
    it('should call service.findAvailable and return success', async () => {
      const req = { query: {} } as Request;
      mockService.findAvailable.mockResolvedValue({
        items: [mockSummary],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.findAvailable(req, mockRes);

      expect(mockService.findAvailable).toHaveBeenCalledWith(1, 10, {});
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getDeliveryStats', () => {
    it('should return top 10 by delivery_count', async () => {
      const items = [
        { id: 'id-1', name: 'Camp A', delivery_count: 100 },
        { id: 'id-2', name: 'Camp B', delivery_count: 50 },
      ];
      mockService.getTopDeliveryStats.mockResolvedValue(items);

      await controller.getDeliveryStats(
        { query: {} } as Request,
        mockRes
      );

      expect(mockService.getTopDeliveryStats).toHaveBeenCalledWith(10);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: { items } })
      );
    });
  });

  describe('findById', () => {
    it('should return 400 when id is invalid', async () => {
      const req = { params: { id: 'invalid-uuid' } } as Request<{ id: string }>;

      await controller.findById(req, mockRes);

      expect(mockService.findById).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should call service.findById and return success', async () => {
      const req = {
        params: { id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d' },
      } as Request<{ id: string }>;
      mockService.findById.mockResolvedValue(mockDetail);

      await controller.findById(req, mockRes);

      expect(mockService.findById).toHaveBeenCalledWith(req.params.id);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockDetail,
        })
      );
    });
  });

  describe('create', () => {
    it('should return 400 when name is empty', async () => {
      const req = { body: { name: '' } } as Request;

      await controller.create(req, mockRes);

      expect(mockService.create).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should call service.create and return 201', async () => {
      const body = { name: 'Nova Campanha', exp_date: '2026-12-31', city_uf: 'SP', enabled: true };
      const req = { body } as Request;
      const created = { ...mockSummary, id: 'new-id', name: 'Nova Campanha' };
      mockService.create.mockResolvedValue(created);

      await controller.create(req, mockRes);

      expect(mockService.create).toHaveBeenCalledWith(body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: created,
          message: 'Campanha criada com sucesso',
        })
      );
    });
  });

  describe('addItem', () => {
    it('should return 400 when campaign id invalid', async () => {
      const req = {
        params: { id: 'bad' },
        body: { title: 'E', type_id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d', lat: -23, long: -46, radius: 100 },
      } as Request<{ id: string }>;

      await controller.addItem(req, mockRes);

      expect(mockService.addCampaignItem).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when item validation fails', async () => {
      const req = {
        params: { id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d' },
        body: { title: '', type_id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d', lat: -23, long: -46, radius: 100 },
      } as Request<{ id: string }>;

      await controller.addItem(req, mockRes);

      expect(mockService.addCampaignItem).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should call addCampaignItem and return 201', async () => {
      const campaignId = 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d';
      const body = {
        title: 'Entrada',
        type_id: 'b2c3d4e5-f6a7-5b1c-9d2e-3f4a5b6c7d8e',
        lat: -23.55,
        long: -46.63,
        radius: 500,
      };
      const req = { params: { id: campaignId }, body } as Request<{ id: string }>;
      mockService.addCampaignItem.mockResolvedValue({ ...item, ...body, lat: '-23.55', long: '-46.63' });

      await controller.addItem(req, mockRes);

      expect(mockService.addCampaignItem).toHaveBeenCalledWith(campaignId, body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('delete', () => {
    it('should call service.softDelete and return success', async () => {
      const req = {
        params: { id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d' },
      } as Request<{ id: string }>;

      await controller.delete(req, mockRes);

      expect(mockService.softDelete).toHaveBeenCalledWith(req.params.id);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
