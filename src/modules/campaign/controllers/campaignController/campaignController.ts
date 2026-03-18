import { Request, Response } from 'express';
import { ICampaignService } from '@campaign/services/campaignService/ICampaignService.js';
import { CampaignValidation } from '@campaign/validations/campaignValidation.js';
import { CreateCampaignDTO, ItemCampaignInput, UpdateCampaignDTO } from '@campaign/models/campaign.js';
import { CampaignListFilters } from '@campaign/repositories/campaignRepository/ICampaignRepository.js';
import { AvailableFilters } from '@campaign/services/campaignService/ICampaignService.js';
import { ApiResponse } from '@shared/utils/apiResponse.js';
import { ErrorHandler } from '@shared/utils/errorHandler.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export class CampaignController {
  constructor(private readonly service: ICampaignService) {}

  private parsePageLimit(query: { page?: string; limit?: string }) {
    const page = Math.max(
      1,
      parseInt(query.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE
    );
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(
        1,
        parseInt(query.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT
      )
    );
    return { page, limit };
  }

  findAll = async (
    req: Request<
      object,
      object,
      object,
      {
        page?: string;
        limit?: string;
        search?: string;
        search_in?: string;
        is_deleted?: string;
        enabled?: string;
      }
    >,
    res: Response
  ): Promise<void> => {
    try {
      const { page, limit } = this.parsePageLimit(req.query);
      const filters: CampaignListFilters = {};
      if (req.query.search !== undefined && req.query.search !== '') {
        filters.search = String(req.query.search).trim();
      }
      if (req.query.search_in === 'name' || req.query.search_in === 'city_uf' || req.query.search_in === 'both') {
        filters.search_in = req.query.search_in;
      }
      if (req.query.is_deleted !== undefined) {
        if (req.query.is_deleted === 'true') filters.is_deleted = true;
        else if (req.query.is_deleted === 'false') filters.is_deleted = false;
      }
      if (req.query.enabled !== undefined) {
        if (req.query.enabled === 'true') filters.enabled = true;
        else if (req.query.enabled === 'false') filters.enabled = false;
      }
      const result = await this.service.findAll(page, limit, filters);
      ApiResponse.success({ res, data: result });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };

  findAvailable = async (
    req: Request<
      object,
      object,
      object,
      {
        page?: string;
        limit?: string;
        search?: string;
        search_in?: string;
        is_deleted?: string;
        enabled?: string;
      }
    >,
    res: Response
  ): Promise<void> => {
    try {
      const { page, limit } = this.parsePageLimit(req.query);
      const filters: AvailableFilters = {};
      if (req.query.search !== undefined && req.query.search !== '') {
        filters.search = String(req.query.search).trim();
      }
      if (req.query.search_in === 'name' || req.query.search_in === 'city_uf' || req.query.search_in === 'both') {
        filters.search_in = req.query.search_in;
      }
      if (req.query.is_deleted !== undefined) {
        if (req.query.is_deleted === 'true') filters.is_deleted = true;
        else if (req.query.is_deleted === 'false') filters.is_deleted = false;
      }
      if (req.query.enabled !== undefined) {
        if (req.query.enabled === 'true') filters.enabled = true;
        else if (req.query.enabled === 'false') filters.enabled = false;
      }
      const result = await this.service.findAvailable(page, limit, filters);
      ApiResponse.success({ res, data: result });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };

  getDeliveryStats = async (
    req: Request<object, object, object, { limit?: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const raw = parseInt(req.query.limit ?? '10', 10);
      const limit = Number.isNaN(raw) ? 10 : Math.min(10, Math.max(1, raw));
      const items = await this.service.getTopDeliveryStats(limit);
      ApiResponse.success({ res, data: { items } });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };

  findById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idError = CampaignValidation.validateUUID(id);
      if (idError) {
        ApiResponse.badRequest(res, idError);
        return;
      }
      const campaign = await this.service.findById(id);
      ApiResponse.success({ res, data: campaign });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body as CreateCampaignDTO;
      const validationErrors = CampaignValidation.validateCreateCampaign(data ?? ({} as CreateCampaignDTO));
      if (validationErrors.length > 0) {
        ApiResponse.validationError({ res, errors: validationErrors });
        return;
      }
      const result = await this.service.create(data);
      ApiResponse.created(res, result, 'Campanha criada com sucesso');
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };

  addItem = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idError = CampaignValidation.validateUUID(id);
      if (idError) {
        ApiResponse.badRequest(res, idError);
        return;
      }
      const body = req.body as ItemCampaignInput;
      const validationErrors = CampaignValidation.validateCampaignItemBody(
        body ?? ({} as ItemCampaignInput)
      );
      if (validationErrors.length > 0) {
        ApiResponse.validationError({ res, errors: validationErrors });
        return;
      }
      const item = await this.service.addCampaignItem(id, body);
      ApiResponse.created(res, item, 'Item da campanha criado com sucesso');
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };

  update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateCampaignDTO = req.body;
      const idError = CampaignValidation.validateUUID(id);
      if (idError) {
        ApiResponse.badRequest(res, idError);
        return;
      }
      const validationErrors = CampaignValidation.validateUpdate(data);
      if (validationErrors.length > 0) {
        ApiResponse.validationError({ res, errors: validationErrors });
        return;
      }
      const campaign = await this.service.update(id, data);
      ApiResponse.success({ res, data: campaign, message: 'Campanha atualizada com sucesso' });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idError = CampaignValidation.validateUUID(id);
      if (idError) {
        ApiResponse.badRequest(res, idError);
        return;
      }
      await this.service.softDelete(id);
      ApiResponse.success({ res, message: 'Campanha excluída com sucesso' });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };
}
