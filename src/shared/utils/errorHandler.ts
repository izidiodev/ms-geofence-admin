import { Response } from 'express';
import { ApiResponse } from './apiResponse.js';

interface ErrorRule {
  match: (message: string) => boolean;
  handler: (res: Response, message: string) => void;
}

export class ErrorHandler {
  private static readonly errorRules: ErrorRule[] = [
    {
      match: (message) => message === 'Credenciais inválidas' || message === 'Usuário inativo',
      handler: (res, message) => ApiResponse.unauthorized(res, message),
    },
    {
      match: (message) => message.includes('não encontrado') || message.includes('não encontrada'),
      handler: (res, message) => ApiResponse.notFound(res, message),
    },
    {
      match: (message) =>
        message.includes('já cadastrado') || message.includes('já existe'),
      handler: (res, message) => ApiResponse.conflict(res, message),
    },
    {
      match: (message) =>
        message.includes('Grupo de campanhas incompleto') ||
        message.includes('Campanha sem itens completos'),
      handler: (res, message) => ApiResponse.badRequest(res, message),
    },
    {
      match: (message) =>
        message.includes('type_id deve ser do tipo enter') ||
        message.includes('Tipo do item inválido'),
      handler: (res, message) => ApiResponse.badRequest(res, message),
    },
  ];

  static handle(res: Response, error: unknown): void {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';

    this.logError(error);

    for (const rule of this.errorRules) {
      if (rule.match(message)) {
        rule.handler(res, message);
        return;
      }
    }

    ApiResponse.internalError(res, message);
  }

  private static logError(error: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorHandler]', error);
    }
  }

  static addRule(rule: ErrorRule): void {
    this.errorRules.unshift(rule);
  }
}
