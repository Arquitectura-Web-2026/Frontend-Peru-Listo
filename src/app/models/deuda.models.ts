/** Models for debts (deudas). */

export interface DeudaDTO {
  id?: number;
  acreedor: string;
  monto: number;
  fechaLimite: string;
  estado: string;
  usuarioId: number;
}
