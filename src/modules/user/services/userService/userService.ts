import { IUserRepository } from '@user/repositories/userRepository/IUserRepository.js';
import { IUserService } from './IUserService.js';
import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserResponse,
  PaginatedUsersResult,
} from '@user/models/user.js';
import { UserListFilters } from '@user/repositories/userRepository/IUserRepository.js';
import { HashPassword } from '@shared/utils/hashPassword.js';
import { randomUUID } from 'crypto';

export class UserService implements IUserService {
  constructor(private readonly repository: IUserRepository) {}

  private toResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_deleted: user.is_deleted,
    };
  }

  async findAll(
    page: number,
    limit: number,
    filters?: UserListFilters
  ): Promise<PaginatedUsersResult> {
    const { data, total } = await this.repository.findAllPaginated(page, limit, filters);
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      items: data.map(this.toResponse),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<UserResponse> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return this.toResponse(user);
  }

  async create(data: CreateUserDTO): Promise<UserResponse> {
    const existingEmail = await this.repository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('E-mail já cadastrado');
    }

    const hashedPassword = await HashPassword.hash(data.password);
    const id = randomUUID();
    const user = await this.repository.create(id, {
      ...data,
      password: hashedPassword,
    });
    return this.toResponse(user);
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserResponse> {
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    if (
      data.email &&
      data.email.toLowerCase() !== existingUser.email.toLowerCase()
    ) {
      const existingEmail = await this.repository.findByEmail(data.email);
      if (existingEmail) {
        throw new Error('E-mail já cadastrado');
      }
    }

    const updateData = { ...data };
    if (data.password) {
      updateData.password = await HashPassword.hash(data.password);
    }

    const user = await this.repository.update(id, updateData);
    if (!user) {
      throw new Error('Falha ao atualizar usuário');
    }
    return this.toResponse(user);
  }

  async softDelete(id: string): Promise<void> {
    const exists = await this.repository.existsById(id);
    if (!exists) {
      throw new Error('Usuário não encontrado');
    }
    const deleted = await this.repository.softDelete(id);
    if (!deleted) {
      throw new Error('Falha ao excluir usuário');
    }
  }
}
