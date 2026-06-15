/** Models for income (ingresos). */

export interface IngresoDTO {
  id?: number;
  descripcion: string;
  monto: number;
  fecha: string;   // LocalDate serialized as ISO string
  usuarioId: number;
}
