export interface Type {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TypeResponse {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PaginatedTypesResult {
  items: TypeResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
