export type EstadoCompra = 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';

export interface DetalleCompraResponse {
  id: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CompraResponse {
  id: number;
  numeroCompra: string;
  proveedorId: number;
  proveedorNombre: string;
  usuarioId: number;
  usuarioNombre: string;
  fecha: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: EstadoCompra;
  detalles: DetalleCompraResponse[];
}

export interface CompraResumenResponse {
  id: number;
  numeroCompra: string;
  proveedorNombre: string;
  fecha: string;
  total: number;
  estado: EstadoCompra;
}

export interface DetalleCompraRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface CompraRequest {
  numeroCompra?: string;
  proveedorId: number;
  estado?: EstadoCompra;
  detalles: DetalleCompraRequest[];
}

export interface CompraFiltros {
  /** ISO datetime, ej. 2026-01-01T00:00:00 */
  desde?: string;
  hasta?: string;
  proveedorId?: number;
}
