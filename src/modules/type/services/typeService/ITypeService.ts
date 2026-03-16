import { TypeResponse, PaginatedTypesResult } from '@type/models/type.js';

export interface ITypeService {
  findAll(page: number, limit: number): Promise<PaginatedTypesResult>;
  findById(id: string): Promise<TypeResponse>;
}
