import { UserResponse } from '@user/models/user.js';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}
