export type EstadoVenta = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';

export interface DetalleVentaResponse {
  id: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaResponse {
  id: number;
  numeroVenta: string;
  clienteId: number;
  clienteNombre: string;
  usuarioId: number;
  usuarioNombre: string;
  fecha: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: EstadoVenta;
  detalles: DetalleVentaResponse[];
}

export interface VentaResumenResponse {
  id: number;
  numeroVenta: string;
  clienteNombre: string;
  fecha: string;
  total: number;
  estado: EstadoVenta;
}

export interface DetalleVentaRequest {
  productoId: number;
  cantidad: number;
  /** Si no se envía, el backend usa el precioVenta del producto. */
  precioUnitario?: number;
}

export interface VentaRequest {
  numeroVenta?: string;
  clienteId: number;
  detalles: DetalleVentaRequest[];
}

export interface VentaFiltros {
  /** ISO datetime, ej. 2026-01-01T00:00:00 */
  desde?: string;
  hasta?: string;
  clienteId?: number;
}

/** Stock actual devuelto por InventarioController. */
export interface StockProductoResponse {
  productoId: number;
  codigo: string;
  nombre: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  bajoStock: boolean;
}

/** Cuerpo de error estándar del backend. */
export interface ErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
  path?: string;
}
