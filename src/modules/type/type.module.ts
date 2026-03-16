import { container } from '@shared/container/index.js';
import { TypeRepository } from '@type/repositories/typeRepository/typeRepository.js';
import { TypeService } from '@type/services/typeService/typeService.js';
import { TypeController } from '@type/controllers/typeController/typeController.js';
import { ITypeRepository } from '@type/repositories/typeRepository/ITypeRepository.js';
import { ITypeService } from '@type/services/typeService/ITypeService.js';

export const TYPE_TOKENS = {
  REPOSITORY: 'TypeRepository',
  SERVICE: 'TypeService',
  CONTROLLER: 'TypeController',
} as const;

export function registerTypeModule(): void {
  container.register<ITypeRepository>(TYPE_TOKENS.REPOSITORY, () => new TypeRepository());

  container.register<ITypeService>(
    TYPE_TOKENS.SERVICE,
    () => new TypeService(container.resolve<ITypeRepository>(TYPE_TOKENS.REPOSITORY))
  );

  container.register<TypeController>(
    TYPE_TOKENS.CONTROLLER,
    () => new TypeController(container.resolve<ITypeService>(TYPE_TOKENS.SERVICE))
  );
}
