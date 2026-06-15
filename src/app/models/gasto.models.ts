/** Models for expenses (gastos) and categories. */

export interface GastoDTO {
  id?: number;
  descripcion: string;
  monto: number;
  fechagasto: string;   // LocalDate serialized as ISO string
  fechacreacion?: string;
  usuarioId: number;
  categoriaId: number;
  categoriaNombre?: string; // populated by backend join
}

export interface CategoriaDTO {
  id: number;
  nombre: string;
  tipo: string;
  colorHex: string;
  esPredeterminada: boolean;
  usuarioId: number;
}
