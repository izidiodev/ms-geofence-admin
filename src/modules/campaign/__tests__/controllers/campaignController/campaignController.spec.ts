import { Request, Response } from 'express';
import { CampaignController } from '@campaign/controllers/campaignController/campaignController.js';
import { ICampaignService } from '@campaign/services/campaignService/ICampaignService.js';
import { CampaignResponse } from '@campaign/models/campaign.js';

const mockCampaignResponse: CampaignResponse = {
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

function createMockService(): jest.Mocked<ICampaignService> {
  return {
    findAll: jest.fn(),
    findAvailable: jest.fn(),
    findById: jest.fn(),
    findByGroupId: jest.fn(),
    createTriplet: jest.fn(),
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
      const req = {
        query: { page: '1', limit: '10' },
      } as Request;
      mockService.findAll.mockResolvedValue({
        items: [mockCampaignResponse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.findAll(req, mockRes);

      expect(mockService.findAll).toHaveBeenCalledWith(1, 10, {});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ items: [mockCampaignResponse] }),
        })
      );
    });
  });

  describe('findAvailable', () => {
    it('should call service.findAvailable and return success', async () => {
      const req = {
        query: {},
      } as Request;
      mockService.findAvailable.mockResolvedValue({
        items: [mockCampaignResponse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.findAvailable(req, mockRes);

      expect(mockService.findAvailable).toHaveBeenCalledWith(1, 10, {});
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should pass search query (ex: Barreiras) to service for filtro por nome ou city_uf', async () => {
      const req = {
        query: { page: '1', limit: '10', search: 'Barreiras' },
      } as Request;
      mockService.findAvailable.mockResolvedValue({
        items: [mockCampaignResponse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await controller.findAvailable(req, mockRes);

      expect(mockService.findAvailable).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({ search: 'Barreiras' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('findById', () => {
    it('should return 400 when id is invalid', async () => {
      const req = {
        params: { id: 'invalid-uuid' },
      } as Request<{ id: string }>;

      await controller.findById(req, mockRes);

      expect(mockService.findById).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: expect.any(String) })
      );
    });

    it('should call service.findById and return success', async () => {
      const req = {
        params: { id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d' },
      } as Request<{ id: string }>;
      mockService.findById.mockResolvedValue(mockCampaignResponse);

      await controller.findById(req, mockRes);

      expect(mockService.findById).toHaveBeenCalledWith(req.params.id);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockCampaignResponse,
        })
      );
    });
  });

  describe('create', () => {
    it('should return 400 when validation fails', async () => {
      const req = {
        body: {
          enter: {
            name: '',
            type_id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d',
            lat: -23.55,
            long: -46.63,
            radius: 500,
          },
          dwell: {
            name: 'Dwell',
            type_id: 'b2c3d4e5-f6a7-5b1c-9d2e-3f4a5b6c7d8e',
            lat: -23.55,
            long: -46.63,
            radius: 500,
          },
          exit: {
            name: 'Exit',
            type_id: 'c3d4e5f6-a7b8-4c2d-8e3f-4a5b6c7d8e9f',
            lat: -23.55,
            long: -46.63,
            radius: 500,
          },
        },
      } as Request;

      await controller.create(req, mockRes);

      expect(mockService.createTriplet).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, errors: expect.any(Array) })
      );
    });

    it('should call service.createTriplet and return 201', async () => {
      const tripletBody = {
        enter: {
          name: 'New Campaign',
          type_id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d',
          lat: -23.55,
          long: -46.63,
          radius: 500,
        },
        dwell: {
          name: 'New Campaign',
          type_id: 'b2c3d4e5-f6a7-5b1c-9d2e-3f4a5b6c7d8e',
          lat: -23.55,
          long: -46.63,
          radius: 500,
        },
        exit: {
          name: 'New Campaign',
          type_id: 'c3d4e5f6-a7b8-4c2d-8e3f-4a5b6c7d8e9f',
          lat: -23.55,
          long: -46.63,
          radius: 500,
        },
      };
      const req = { body: tripletBody } as Request;
      const tripletResponse = {
        campaign_group_id: 'group-uuid',
        enter: mockCampaignResponse,
        dwell: { ...mockCampaignResponse, id: 'dwell-id' },
        exit: { ...mockCampaignResponse, id: 'exit-id' },
      };
      mockService.createTriplet.mockResolvedValue(tripletResponse);

      await controller.create(req, mockRes);

      expect(mockService.createTriplet).toHaveBeenCalled();
      const callArg = mockService.createTriplet.mock.calls[0][0];
      expect(callArg).toHaveProperty('enter', expect.objectContaining({ name: 'New Campaign', type_id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d' }));
      expect(callArg).toHaveProperty('dwell', expect.objectContaining({ name: 'New Campaign' }));
      expect(callArg).toHaveProperty('exit', expect.objectContaining({ name: 'New Campaign' }));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: tripletResponse,
          message: 'Campanhas (entrada, permanência e saída) criadas com sucesso',
        })
      );
    });
  });

  describe('delete', () => {
    it('should return 400 when id is invalid', async () => {
      const req = {
        params: { id: 'invalid' },
      } as Request<{ id: string }>;

      await controller.delete(req, mockRes);

      expect(mockService.softDelete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should call service.softDelete and return success', async () => {
      const req = {
        params: { id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d' },
      } as Request<{ id: string }>;

      await controller.delete(req, mockRes);

      expect(mockService.softDelete).toHaveBeenCalledWith(req.params.id);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Campanha excluída com sucesso',
        })
      );
    });
  });
});
