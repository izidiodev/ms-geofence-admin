import { IAuthService } from './IAuthService.js';
import { IUserRepository } from '@user/repositories/userRepository/IUserRepository.js';
import { LoginDTO, AuthResponse } from '../../models/auth.js';
import { UserResponse } from '@user/models/user.js';
import { HashPassword } from '@shared/utils/hashPassword.js';
import { JwtToken } from '@shared/utils/jwtToken.js';

export class AuthService implements IAuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    if (user.is_deleted) {
      throw new Error('Usuário inativo');
    }

    const isPasswordValid = await HashPassword.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    const token = JwtToken.generate({
      userId: user.id,
      email: user.email,
    });

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_deleted: user.is_deleted,
    };

    return {
      user: userResponse,
      token,
    };
  }
}
