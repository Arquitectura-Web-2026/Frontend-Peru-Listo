/** Models for the dashboard page. */

export interface DashboardResumenDTO {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  mes: number;
  anio: number;
}

export interface GastosCategoriaDTO {
  categoriaNombre: string;
  monto: number;
  porcentaje: number;
}

export interface ComparativaMensualDTO {
  mes: number;
  anio: number;
  ingresos: number;
  gastos: number;
}
