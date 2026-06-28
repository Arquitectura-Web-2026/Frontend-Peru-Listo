/** Models for Educación Financiera (financial education articles). */

export interface ArticuloEducacionDTO {
  id?: number;
  titulo: string;
  descripcionCorta: string;
  cuerpo: string;
  categoriaTematica: string;
  fechaPublicacion?: string;
}
