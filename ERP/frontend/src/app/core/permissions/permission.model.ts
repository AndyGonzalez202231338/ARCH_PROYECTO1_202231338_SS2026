export type Role = 'ADMINISTRACION' | 'COMPRAS' | 'INVENTARIO' | 'VENTAS';

export enum AccessLevel {
  NONE = 'NONE',
  READ = 'READ',
  FULL = 'FULL', // cubre tanto "CRUD": acceso total
}

/**
 * Un PermissionKey representa una fila de tu tabla de accesos
 * (módulo o función específica), no necesariamente una ruta 1:1.
 * Varias rutas pueden compartir el mismo PermissionKey.
 */
export type PermissionKey =
  | 'usuarios'
  | 'productos'
  | 'proveedores'
  | 'clientes'
  | 'compras-registrar'
  | 'compras-consultar'
  | 'ventas-registrar'
  | 'ventas-consultar'
  | 'inventario-stock'
  | 'inventario-movimientos'
  | 'inventario-ajustes'
  | 'reportes'
  | 'logs-auditoria';