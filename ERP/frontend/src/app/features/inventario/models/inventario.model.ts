export interface StockProductoRaw {
  productoId: number;
  codigo: string;
  nombre: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  bajoStock: boolean;
}

/** Enriquecido en el service — lo que consumen los componentes */
export interface StockProductoResponse {
  productoId: number;
  codigo: string;
  nombre: string;
  categoria: string;
  categoriaId: number;
  stockActual: number;
  stockMinimo: number;
  bajoStock: boolean;
  precioVenta: number;
  valorInventario: number;
}

export interface MovimientoInventarioResponse {
  id: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  tipoMovimiento: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  saldoDisponible: number;
  costoUnitario: number;
  stockAnterior: number;
  stockNuevo: number;
  referenciaTipo: 'COMPRA' | 'VENTA';
  referenciaId: number;
  usuarioId: number;
  usuarioNombre: string;
  fecha: string;
}

export interface ProductoResumen {
  id: number;
  codigo: string;
  nombre: string;
  categoriaNombre: string;
  stockActual: number;
  stockMinimo: number;
}

export interface CategoriaResumen {
  id: number;
  nombre: string;
}

export interface InventarioFiltros {
  texto?: string;
  categoriaId?: number;
  soloBajoStock?: boolean;
}

export interface MovimientoFiltros {
  desde?: string;
  hasta?: string;
  tipo?: 'ENTRADA' | 'SALIDA' | '';
}