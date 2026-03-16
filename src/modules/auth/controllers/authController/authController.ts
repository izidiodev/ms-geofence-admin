import { Request, Response } from 'express';
import { IAuthService } from '../../services/authService/IAuthService.js';
import { AuthValidation } from '../../validations/authValidation.js';
import { LoginDTO } from '../../models/auth.js';
import { ApiResponse } from '@shared/utils/apiResponse.js';
import { ErrorHandler } from '@shared/utils/errorHandler.js';

export class AuthController {
  constructor(private readonly service: IAuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: LoginDTO = req.body;

      const validationErrors = AuthValidation.validateLogin(data);
      if (validationErrors.length > 0) {
        ApiResponse.validationError({ res, errors: validationErrors });
        return;
      }

      const result = await this.service.login(data);
      ApiResponse.success({ res, data: result, message: 'Login realizado com sucesso' });
    } catch (error) {
      ErrorHandler.handle(res, error);
    }
  };
}
