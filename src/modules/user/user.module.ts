import { container } from '@shared/container/index.js';
import { UserRepository } from '@user/repositories/userRepository/userRepository.js';
import { UserService } from '@user/services/userService/userService.js';
import { UserController } from '@user/controllers/userController/userController.js';
import { IUserRepository } from '@user/repositories/userRepository/IUserRepository.js';
import { IUserService } from '@user/services/userService/IUserService.js';

export const USER_TOKENS = {
  REPOSITORY: 'UserRepository',
  SERVICE: 'UserService',
  CONTROLLER: 'UserController',
} as const;

export function registerUserModule(): void {
  container.register<IUserRepository>(USER_TOKENS.REPOSITORY, () => new UserRepository());

  container.register<IUserService>(
    USER_TOKENS.SERVICE,
    () =>
      new UserService(container.resolve<IUserRepository>(USER_TOKENS.REPOSITORY))
  );

  container.register<UserController>(
    USER_TOKENS.CONTROLLER,
    () =>
      new UserController(container.resolve<IUserService>(USER_TOKENS.SERVICE))
  );
}
