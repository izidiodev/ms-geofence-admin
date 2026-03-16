export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface PaginatedUsersResult {
  items: UserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
