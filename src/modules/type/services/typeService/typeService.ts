import { ITypeRepository } from '@type/repositories/typeRepository/ITypeRepository.js';
import { ITypeService } from './ITypeService.js';
import { Type, TypeResponse, PaginatedTypesResult } from '@type/models/type.js';

export class TypeService implements ITypeService {
  constructor(private readonly repository: ITypeRepository) {}

  private toResponse(type: Type): TypeResponse {
    return {
      id: type.id,
      name: type.name,
      description: type.description,
      created_at: type.created_at,
      updated_at: type.updated_at,
    };
  }

  async findAll(page: number, limit: number): Promise<PaginatedTypesResult> {
    const { data, total } = await this.repository.findAllPaginated(page, limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      items: data.map(this.toResponse),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<TypeResponse> {
    const type = await this.repository.findById(id);
    if (!type) {
      throw new Error('Tipo não encontrado');
    }
    return this.toResponse(type);
  }
}
