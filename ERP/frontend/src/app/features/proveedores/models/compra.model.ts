/**
 * Forma asumida de CompraResumenResponse (no se tuvo el DTO real del backend).
 * Si los nombres de campo no coinciden con lo que devuelve CompraController,
 * ajusta esta interfaz y el template de proveedor-detalle.
 */
export interface CompraResumenResponse {
  id: number;
  numero?: string;
  fecha: string;
  total: number;
  estado?: string;
}
