/** Models for authentication: login, register, and JWT response. */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombreCompleto: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  correo: string;
  role: string;
}
