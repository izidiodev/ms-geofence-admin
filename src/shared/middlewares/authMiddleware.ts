import { Request, Response, NextFunction } from 'express';
import { JwtToken } from '../utils/jwtToken.js';
import { JwtPayload } from '../../modules/auth/models/auth.js';
import { ApiResponse } from '../utils/apiResponse.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization?.trim();

    if (!authHeader) {
      ApiResponse.unauthorized(res, 'Token não informado');
      return;
    }

    const parts = authHeader.split(/\s+/);
    const scheme = parts[0];
    const token = parts.slice(1).join(' ').trim();

    if (scheme?.toLowerCase() !== 'bearer') {
      ApiResponse.unauthorized(res, 'Token malformado: use "Bearer <token>"');
      return;
    }

    if (!token) {
      ApiResponse.unauthorized(res, 'Token não informado ou vazio (defina o token no ambiente após o login)');
      return;
    }

    const payload = JwtToken.verify(token);
    req.user = payload;

    next();
  } catch {
    ApiResponse.unauthorized(res, 'Token inválido ou expirado');
  }
}
