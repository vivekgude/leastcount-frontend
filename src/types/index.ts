export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password';
  required: boolean;
  placeholder?: string;
} 