import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { JwtPayload } from '../../modules/auth/models/auth.js';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getExpiresIn(): jwt.SignOptions['expiresIn'] {
  const raw = process.env.JWT_EXPIRES_IN || '24h';
  const trimmed = String(raw).trim();
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  return trimmed as jwt.SignOptions['expiresIn'];
}

export class JwtToken {
  static generate(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: getExpiresIn(),
    };
    return jwt.sign(payload as object, JWT_SECRET, options);
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }

  static decode(token: string): JwtPayload | null {
    const decoded = jwt.decode(token);
    return decoded as JwtPayload | null;
  }
}
