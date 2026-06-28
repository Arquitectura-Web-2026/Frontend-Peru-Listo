/** Models for the Admin module. */

export interface AdminDashboardDTO {
  totalUsuarios: number;
  usuariosNuevosEsteMes: number;
  totalTransacciones: number;
  totalGastosSistema: number;
  totalIngresosSistema: number;
  totalDeudasPendientes: number;
  totalMetasAhorro: number;
}

export interface AdminUsuarioDTO {
  id: number;
  nombreCompleto: string;
  correo: string;
  role: string;
  fechaRegistro: string;
  totalGastos: number;
  totalIngresos: number;
  totalDeudas: number;
}

export interface AdminUsuarioDetalleDTO {
  id: number;
  nombreCompleto: string;
  correo: string;
  role: string;
  fechaRegistro: string;
  totalGastos: number;
  totalIngresos: number;
  totalDeudas: number;
  totalMetas: number;
  totalPresupuestos: number;
}
