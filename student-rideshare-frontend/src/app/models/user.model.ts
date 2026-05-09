export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: 'RIDER' | 'PILLION' | 'BOTH';
  phoneNumber?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}