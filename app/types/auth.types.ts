// app/types/auth.types.ts
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface User {
  _id: string;
  email: string;
  password: string;
  role: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}