export interface TopProductoResponse {
  productoId: number;
  codigo?: string;
  nombre: string;
  valor: number;
}

export interface TopProveedorResponse {
  proveedorId: number;
  nombre: string;
  cantidadCompras: number;
  montoTotal: number;
}

export interface TopClienteResponse {
  clienteId: number;
  nombre: string;
  cantidadVentas: number;
  montoTotal: number;
}

export interface ResumenVentasPeriodoResponse {
  periodo: string;
  cantidadVentas: number;
  totalVentas: number;
}

export interface ProductoBajoStockResponse {
  productoId: number;
  codigo: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
}

export interface CompraResumenResponse {
  id: number;
  numeroCompra: string;
  proveedorNombre: string;
  fecha: string;
  total: number;
  estado: string;
}

export interface VentaResumenResponse {
  id: number;
  numeroVenta: string;
  clienteNombre: string;
  fecha: string;
  total: number;
  estado: string;
}

export interface LogAuditoriaResponse {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  fecha: string;
  modulo: string;
  tipoAccion: string;
  detalle: string;
}

/* ---------------- Filtros y tipos ---------------- */

export interface ReporteFiltros {
  desde?: string;
  hasta?: string;
  top?: number;
  agrupacion?: 'DIA' | 'MES' | 'ANIO';
}

export type TipoReporte =
  | 'productos-mas-vendidos'
  | 'productos-menor-existencia'
  | 'productos-mas-movimientos'
  | 'historial-movimientos'
  | 'compras-por-rango'
  | 'top-proveedores'
  | 'productos-mas-adquiridos'
  | 'ventas-por-rango'
  | 'top-clientes'
  | 'productos-mayores-ingresos'
  | 'resumen-ventas'
  | 'logs-auditoria';

export type Rol = 'ADMINISTRACION' | 'COMPRAS' | 'INVENTARIO' | 'VENTAS';

export type CategoriaReporte = 'productos' | 'compras' | 'ventas' | 'auditoria';

export type BadgeTipo = 'TOP' | 'RANGO' | 'DETALLE';

export interface ReporteConfig {
  tipo: TipoReporte;
  titulo: string;
  descripcion: string;
  icono: string;
  categoria: CategoriaReporte;
  roles: Rol[];
  badge: BadgeTipo;
  badgeLabel: string;
  /** true si el reporte pide rango de fechas */
  usaFechas: boolean;
  /** true si el reporte pide "Top N" */
  usaTop: boolean;
  /** true solo para resumen-ventas */
  usaAgrupacion: boolean;
  /** true solo para historial-movimientos */
  usaProducto: boolean;
}

export interface CategoriaConfig {
  id: CategoriaReporte;
  titulo: string;
  icono: string;
}

export const CATEGORIAS: CategoriaConfig[] = [
  { id: 'productos', titulo: 'Productos e Inventario', icono: '' },
  { id: 'compras',   titulo: 'Compras y Proveedores',  icono: '' },
  { id: 'ventas',    titulo: 'Ventas y Clientes',      icono: '' },
  { id: 'auditoria', titulo: 'Auditoría',              icono: '' },
];

/* ---------------- Catálogo de reportes ---------------- */

export const REPORTES_DISPONIBLES: ReporteConfig[] = [
  {
    tipo: 'productos-mas-vendidos',
    titulo: 'Top productos más vendidos',
    descripcion: 'Productos con mayor cantidad de unidades vendidas.',
    icono: '',
    categoria: 'productos',
    roles: ['ADMINISTRACION', 'INVENTARIO', 'VENTAS'],
    badge: 'TOP', badgeLabel: 'TOP N',
    usaFechas: true, usaTop: true, usaAgrupacion: false, usaProducto: false,
  },
  {
    tipo: 'productos-menor-existencia',
    titulo: 'Productos con menor existencia',
    descripcion: 'Productos cuyo stock está por debajo del mínimo.',
    icono: '',
    categoria: 'productos',
    roles: ['ADMINISTRACION', 'INVENTARIO'],
    badge: 'TOP', badgeLabel: 'TOP N',
    usaFechas: false, usaTop: true, usaAgrupacion: false, usaProducto: false,
  },
  {
    tipo: 'productos-mas-movimientos',
    titulo: 'Productos con más movimientos',
    descripcion: 'Productos con mayor rotación en el inventario.',
    icono: '',
    categoria: 'productos',
    roles: ['ADMINISTRACION', 'INVENTARIO'],
    badge: 'TOP', badgeLabel: 'TOP N',
    usaFechas: true, usaTop: true, usaAgrupacion: false, usaProducto: false,
  },
  {
    tipo: 'historial-movimientos',
    titulo: 'Historial de movimientos',
    descripcion: 'Movimientos detallados de un producto específico.',
    icono: '',
    categoria: 'productos',
    roles: ['ADMINISTRACION', 'INVENTARIO'],
    badge: 'DETALLE', badgeLabel: 'DETALLE',
    usaFechas: true, usaTop: false, usaAgrupacion: false, usaProducto: true,
  },
  {
    tipo: 'compras-por-rango',
    titulo: 'Compras por rango de fechas',
    descripcion: 'Listado de compras realizadas en un período.',
    icono: '',
    categoria: 'compras',
    roles: ['ADMINISTRACION', 'COMPRAS'],
    badge: 'RANGO', badgeLabel: 'RANGO',
    usaFechas: true, usaTop: false, usaAgrupacion: false, usaProducto: false,
  },
  {
    tipo: 'top-proveedores',
    titulo: 'Top proveedores por monto',
    descripcion: 'Proveedores con mayor volumen de compras.',
    icono: '',
    categoria: 'compras',
    roles: ['ADMINISTRACION', 'COMPRAS'],
    badge: 'TOP', badgeLabel: 'TOP N',
    usaFechas: false, usaTop: true, usaAgrupacion: false, usaProducto: false,
  },
  {
    tipo: 'productos-mas-adquiridos',
    titulo: 'Productos más adquiridos',
    descripcion: 'Productos con mayor cantidad comprada a proveedores.',
    icono: '',
    categoria: 'compras',
    roles: ['ADMINISTRACION', 'COMPRAS'],
    badge: 'TOP', badgeLabel: 'TOP N',
    usaFechas: false, usaTop: true, usaAgrupacion: false, usaProducto: false,
  },
  {
    tipo: 'ventas-por-rango',
    titulo: 'Ventas por rango de fechas',
    descripcion: 'Listado de ventas realizadas en un período.',
    icono: '',
    categoria: 'ventas',
    roles: ['ADMINISTRACION', 'VENTAS'],
    badge: 'RANGO', badgeLabel: 'RANGO',
    usaFechas: true, usaTop: false, usaAgrupacion: false, usaProducto: false,
  },
  {
    tipo: 'top-clientes',
    titulo: 'Top clientes por monto',
    descripcion: 'Clientes con mayor volumen de compras.',
    icono: '',
    categoria: 'ventas',
    roles: ['ADMINISTRACION', 'VENTAS'],
    badge: 'TOP', badgeLabel: 'TOP N',
    usaFechas: false, usaTop: true, usaAgrupacion: false, usaProducto: false,
  },
  {
    tipo: 'productos-mayores-ingresos',
    titulo: 'Productos con mayores ingresos',
    descripcion: 'Productos que generan más ingresos por ventas.',
    icono: '',
    categoria: 'ventas',
    roles: ['ADMINISTRACION', 'VENTAS'],
    badge: 'TOP', badgeLabel: 'TOP N',
    usaFechas: true, usaTop: true, usaAgrupacion: false, usaProducto: false,
  },
  {
    tipo: 'resumen-ventas',
    titulo: 'Resumen de ventas por período',
    descripcion: 'Ventas agrupadas por día, mes o año.',
    icono: '',
    categoria: 'ventas',
    roles: ['ADMINISTRACION', 'VENTAS'],
    badge: 'RANGO', badgeLabel: 'RANGO',
    usaFechas: true, usaTop: false, usaAgrupacion: true, usaProducto: false,
  },
  {
    tipo: 'logs-auditoria',
    titulo: 'Logs de auditoría',
    descripcion: 'Registro de acciones realizadas en el sistema.',
    icono: '',
    categoria: 'auditoria',
    roles: ['ADMINISTRACION'],
    badge: 'DETALLE', badgeLabel: 'DETALLE',
    usaFechas: true, usaTop: false, usaAgrupacion: false, usaProducto: false,
  },
];

export function getReporteConfig(tipo: TipoReporte): ReporteConfig | undefined {
  return REPORTES_DISPONIBLES.find(r => r.tipo === tipo);
}