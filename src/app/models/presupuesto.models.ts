/** Models for budgets (presupuestos). */

export interface PresupuestoDTO {
  id?: number;
  mes: number;
  anio: number;
  montoLimite: number;   // BigDecimal → number
  usuarioId: number;
  categoriaId: number;
}

export interface ResumenPresupuestoDTO {
  categoria: string;
  montoLimite: number;
  montoGastado: number;
  porcentajeUso: number;
}
