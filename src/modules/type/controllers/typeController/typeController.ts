import { Request, Response } from 'express';
import { ITypeService } from '@type/services/typeService/ITypeService.js';
import { ApiResponse } from '@shared/utils/apiResponse.js';
import { ErrorHandler } from '@shared/utils/errorHandler.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export class TypeController {
  constructor(private readonly service: ITypeService) {}

  findAll = async (
    req: Request<object, object, object, { page?: string; limit?: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const page = Math.max(
        1,
        parseInt(req.query.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE
      );
      const limit = Math.min(
        MAX_LIMIT,
        Math.max(
          1,
          parseInt(req.query.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT
        )
      );
      const result = await this.service.findAll(page, limit);
      ApiResponse.success({ res, data: result });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };
}
