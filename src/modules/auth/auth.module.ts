import { container } from '@shared/container/index.js';
import { AuthService } from './services/authService/authService.js';
import { AuthController } from './controllers/authController/authController.js';
import { USER_TOKENS } from '@user/user.module.js';
import { IUserRepository } from '@user/repositories/userRepository/IUserRepository.js';

export const AUTH_TOKENS = {
  SERVICE: 'AuthService',
  CONTROLLER: 'AuthController',
} as const;

export function registerAuthModule(): void {
  container.register(AUTH_TOKENS.SERVICE, () =>
    new AuthService(container.resolve<IUserRepository>(USER_TOKENS.REPOSITORY))
  );
  container.register(AUTH_TOKENS.CONTROLLER, () =>
    new AuthController(container.resolve(AUTH_TOKENS.SERVICE))
  );
}
