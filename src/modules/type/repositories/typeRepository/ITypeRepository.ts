import { Type } from '@type/models/type.js';

export interface PaginatedTypeRepositoryResult {
  data: Type[];
  total: number;
}

export interface ITypeRepository {
  findAllPaginated(page: number, limit: number): Promise<PaginatedTypeRepositoryResult>;
  findById(id: string): Promise<Type | null>;
}
