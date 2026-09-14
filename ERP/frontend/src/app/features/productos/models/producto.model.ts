export interface ProductoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  categoriaNombre: string;
  precioCompra: number;
  precioVenta: number;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
  bajoStock: boolean;
}

export interface ProductoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  precioCompra: number;
  precioVenta: number;
  unidadMedida: string;
  stockMinimo: number;
  activo?: boolean;
}

export interface ProductoFiltros {
  categoriaId?: number;
  activo?: boolean;
  texto?: string;
}

export const UNIDADES_MEDIDA = ['UND', 'PAQ', 'CAJA', 'KG', 'LB', 'LT', 'ML'] as const;
