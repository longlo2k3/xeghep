export type Role = 'admin' | 'editor' | 'dispatcher';

export interface User {
  id: number;
  email: string;
  fullName?: string | null;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
  token: string;
  exp?: number;
}
