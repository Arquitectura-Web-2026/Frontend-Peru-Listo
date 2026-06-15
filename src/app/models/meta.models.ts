/** Models for savings goals (metas de ahorro). */

export interface MetaAhorroDTO {
  id?: number;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  fechaLimite: string;
  estado: string;
  fechaCreacion?: string;
  usuarioId: number;
}

export interface ProgresoMetaDTO {
  metaId: number;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  porcentaje: number;
  estado: string;
}
