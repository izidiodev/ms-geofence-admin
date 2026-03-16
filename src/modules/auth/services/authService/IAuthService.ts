import { LoginDTO, AuthResponse } from '../../models/auth.js';

export interface IAuthService {
  login(data: LoginDTO): Promise<AuthResponse>;
}
