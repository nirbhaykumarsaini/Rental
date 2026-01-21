// app/types/auth.types.ts
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  company?: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface ResetPasswordData {
  email: string;
}

export interface NewPasswordData {
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  isVerified: boolean;
  jobTitle:string;
  department:string;
  location:string;
  bio:string;
  timezone:string;
  language:string;
  currency:string;
  dateFormat:string;
  phone:string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}