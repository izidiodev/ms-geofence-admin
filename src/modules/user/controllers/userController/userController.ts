import { Request, Response } from 'express';
import { IUserService } from '@user/services/userService/IUserService.js';
import { UserValidation } from '@user/validations/userValidation.js';
import { CreateUserDTO, UpdateUserDTO } from '@user/models/user.js';
import { UserListFilters } from '@user/repositories/userRepository/IUserRepository.js';
import { ApiResponse } from '@shared/utils/apiResponse.js';
import { ErrorHandler } from '@shared/utils/errorHandler.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export class UserController {
  constructor(private readonly service: IUserService) {}

  findAll = async (
    req: Request<
      object,
      object,
      object,
      { page?: string; limit?: string; search?: string; is_deleted?: string }
    >,
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

      const filters: UserListFilters = {};
      if (req.query.search !== undefined && req.query.search !== '') {
        filters.search = String(req.query.search).trim();
      }
      if (req.query.is_deleted !== undefined) {
        const v = req.query.is_deleted;
        if (v === 'true') filters.is_deleted = true;
        else if (v === 'false') filters.is_deleted = false;
      }

      const result = await this.service.findAll(page, limit, filters);
      ApiResponse.success({ res, data: result });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };

  findById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idError = UserValidation.validateUUID(id);
      if (idError) {
        ApiResponse.badRequest(res, idError);
        return;
      }
      const user = await this.service.findById(id);
      ApiResponse.success({ res, data: user });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateUserDTO = req.body;
      const validationErrors = UserValidation.validateCreate(data);
      if (validationErrors.length > 0) {
        ApiResponse.validationError({ res, errors: validationErrors });
        return;
      }
      const user = await this.service.create(data);
      ApiResponse.created(res, user, 'Usuário criado com sucesso');
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };

  update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateUserDTO = req.body;
      const idError = UserValidation.validateUUID(id);
      if (idError) {
        ApiResponse.badRequest(res, idError);
        return;
      }
      const validationErrors = UserValidation.validateUpdate(data);
      if (validationErrors.length > 0) {
        ApiResponse.validationError({ res, errors: validationErrors });
        return;
      }
      const user = await this.service.update(id, data);
      ApiResponse.success({ res, data: user, message: 'Usuário atualizado com sucesso' });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const idError = UserValidation.validateUUID(id);
      if (idError) {
        ApiResponse.badRequest(res, idError);
        return;
      }
      await this.service.softDelete(id);
      ApiResponse.success({ res, message: 'Usuário excluído com sucesso' });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };
}
