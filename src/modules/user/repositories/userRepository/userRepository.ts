import { Repository } from 'typeorm';
import { User, CreateUserDTO, UpdateUserDTO } from '@user/models/user.js';
import { UserEntity } from '@user/entities/user.entity.js';
import { AppDataSource } from '@shared/infra/database/data-source.js';
import { IUserRepository, UserListFilters } from './IUserRepository.js';

export class UserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    filters?: UserListFilters
  ): Promise<{ data: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (filters?.is_deleted !== undefined) {
      where.is_deleted = filters.is_deleted;
    }

    if (filters?.search && filters.search.trim()) {
      const search = `%${filters.search.trim()}%`;
      const qb = this.repository
        .createQueryBuilder('user')
        .where(
          '(unaccent(user.name) ILIKE unaccent(:search) OR unaccent(user.email) ILIKE unaccent(:search))',
          { search }
        )
        .orderBy('user.name', 'ASC')
        .skip(skip)
        .take(limit);
      if (filters?.is_deleted !== undefined) {
        qb.andWhere('user.is_deleted = :is_deleted', {
          is_deleted: filters.is_deleted,
        });
      }
      const [data, total] = await qb.getManyAndCount();
      return { data, total };
    }

    const [data, total] = await this.repository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip,
      take: limit,
    });
    return { data, total };
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async create(id: string, data: CreateUserDTO): Promise<User> {
    const user = this.repository.create({
      id,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
      is_deleted: false,
    });
    return await this.repository.save(user);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    const user = await this.repository.findOneBy({ id });
    if (!user) return null;

    const updatedData: Partial<UserEntity> = {};
    if (data.name !== undefined) updatedData.name = data.name.trim();
    if (data.email !== undefined) updatedData.email = data.email.toLowerCase().trim();
    if (data.password !== undefined) updatedData.password = data.password;

    await this.repository.update(id, updatedData);
    return await this.repository.findOneBy({ id });
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { is_deleted: true });
    return (result.affected ?? 0) > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.repository.countBy({ id });
    return count > 0;
  }
}
