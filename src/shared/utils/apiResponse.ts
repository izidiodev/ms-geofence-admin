import { Response } from 'express';

interface SuccessOptions<T> {
  res: Response;
  data?: T;
  message?: string;
  statusCode?: number;
}

interface ErrorOptions {
  res: Response;
  error: string;
  statusCode?: number;
}

interface ValidationErrorOptions {
  res: Response;
  errors: string[];
}

export class ApiResponse {
  static success<T>({ res, data, message, statusCode = 200 }: SuccessOptions<T>): void {
    res.status(statusCode).json({
      success: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
    });
  }

  static created<T>(res: Response, data: T, message?: string): void {
    this.success({ res, data, message, statusCode: 201 });
  }

  static error({ res, error, statusCode = 500 }: ErrorOptions): void {
    res.status(statusCode).json({
      success: false,
      error,
    });
  }

  static badRequest(res: Response, error: string): void {
    this.error({ res, error, statusCode: 400 });
  }

  static notFound(res: Response, error: string = 'Recurso não encontrado'): void {
    this.error({ res, error, statusCode: 404 });
  }

  static unauthorized(res: Response, error: string = 'Não autorizado'): void {
    this.error({ res, error, statusCode: 401 });
  }

  static forbidden(res: Response, error: string = 'Acesso negado'): void {
    this.error({ res, error, statusCode: 403 });
  }

  static conflict(res: Response, error: string): void {
    this.error({ res, error, statusCode: 409 });
  }

  static internalError(res: Response, error: string = 'Erro interno do servidor'): void {
    this.error({ res, error, statusCode: 500 });
  }

  static validationError({ res, errors }: ValidationErrorOptions): void {
    res.status(400).json({
      success: false,
      errors,
    });
  }
}
