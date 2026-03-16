import { User, CreateUserDTO, UpdateUserDTO } from '@user/models/user.js';

export interface UserListFilters {
  search?: string;
  is_deleted?: boolean;
}

export interface PaginatedRepositoryResult {
  data: User[];
  total: number;
}

export interface IUserRepository {
  findAllPaginated(
    page: number,
    limit: number,
    filters?: UserListFilters
  ): Promise<PaginatedRepositoryResult>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(id: string, data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User | null>;
  softDelete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}
