/** Models for user profile (usuario). */

export interface UsuarioDTO {
  id: number;
  nombreCompleto: string;
  correo: string;
  fechaRegistro: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
