import { Repository } from 'typeorm';
import { Type } from '@type/models/type.js';
import { TypeEntity } from '@type/entities/type.entity.js';
import { AppDataSource } from '@shared/infra/database/data-source.js';
import { ITypeRepository } from './ITypeRepository.js';

export class TypeRepository implements ITypeRepository {
  private repository: Repository<TypeEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(TypeEntity);
  }

  async findAllPaginated(page: number, limit: number): Promise<{ data: Type[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.repository.findAndCount({
      order: { name: 'ASC' },
      skip,
      take: limit,
    });
    return { data, total };
  }

  async findById(id: string): Promise<Type | null> {
    return await this.repository.findOneBy({ id });
  }
}
