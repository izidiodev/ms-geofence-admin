import {
  CreateUserDTO,
  UpdateUserDTO,
  UserResponse,
  PaginatedUsersResult,
} from '@user/models/user.js';
import { UserListFilters } from '@user/repositories/userRepository/IUserRepository.js';

export interface IUserService {
  findAll(
    page: number,
    limit: number,
    filters?: UserListFilters
  ): Promise<PaginatedUsersResult>;
  findById(id: string): Promise<UserResponse>;
  create(data: CreateUserDTO): Promise<UserResponse>;
  update(id: string, data: UpdateUserDTO): Promise<UserResponse>;
  softDelete(id: string): Promise<void>;
}
