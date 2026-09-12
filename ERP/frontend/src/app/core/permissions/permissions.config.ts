import { AccessLevel, PermissionKey, Role } from './permission.model';

/**
 * Matriz de permisos: PermissionKey -> Role -> AccessLevel
 * Transcrita directamente de la tabla "Resumen de accesos por módulo".
 *
 * NONE = x        (sin acceso)
 * READ = R        (solo lectura/consulta)
 * FULL = CRUD/ (acceso total: crear, leer, actualizar, eliminar)
 */
export const PERMISSIONS_MATRIX: Record<PermissionKey, Record<Role, AccessLevel>> = {
  usuarios: {
    ADMINISTRACION: AccessLevel.FULL, COMPRAS: AccessLevel.NONE,
    INVENTARIO: AccessLevel.NONE, VENTAS: AccessLevel.NONE,
  },
  productos: {
    ADMINISTRACION: AccessLevel.FULL, COMPRAS: AccessLevel.READ,
    INVENTARIO: AccessLevel.FULL, VENTAS: AccessLevel.READ,
  },
  proveedores: {
    ADMINISTRACION: AccessLevel.FULL, COMPRAS: AccessLevel.FULL,
    INVENTARIO: AccessLevel.NONE, VENTAS: AccessLevel.NONE,
  },
  clientes: {
    ADMINISTRACION: AccessLevel.FULL, COMPRAS: AccessLevel.NONE,
    INVENTARIO: AccessLevel.NONE, VENTAS: AccessLevel.FULL,
  },
  'compras-registrar': {
    ADMINISTRACION: AccessLevel.NONE, COMPRAS: AccessLevel.FULL,
    INVENTARIO: AccessLevel.NONE, VENTAS: AccessLevel.NONE,
  },
  'compras-consultar': {
    ADMINISTRACION: AccessLevel.FULL, COMPRAS: AccessLevel.FULL,
    INVENTARIO: AccessLevel.READ, VENTAS: AccessLevel.READ,
  },
  'ventas-registrar': {
    ADMINISTRACION: AccessLevel.NONE, COMPRAS: AccessLevel.NONE,
    INVENTARIO: AccessLevel.NONE, VENTAS: AccessLevel.FULL,
  },
  'ventas-consultar': {
    ADMINISTRACION: AccessLevel.FULL, COMPRAS: AccessLevel.READ,
    INVENTARIO: AccessLevel.READ, VENTAS: AccessLevel.FULL,
  },
  'inventario-stock': {
    ADMINISTRACION: AccessLevel.FULL, COMPRAS: AccessLevel.READ,
    INVENTARIO: AccessLevel.FULL, VENTAS: AccessLevel.READ,
  },
  'inventario-movimientos': {
    ADMINISTRACION: AccessLevel.FULL, COMPRAS: AccessLevel.NONE,
    INVENTARIO: AccessLevel.FULL, VENTAS: AccessLevel.NONE,
  },
  'inventario-ajustes': {
    ADMINISTRACION: AccessLevel.FULL, COMPRAS: AccessLevel.NONE,
    INVENTARIO: AccessLevel.FULL, VENTAS: AccessLevel.NONE,
  },
 
  reportes: {
    ADMINISTRACION: AccessLevel.FULL, COMPRAS: AccessLevel.FULL,
    INVENTARIO: AccessLevel.FULL, VENTAS: AccessLevel.FULL,
  },
  'logs-auditoria': {
    ADMINISTRACION: AccessLevel.FULL, COMPRAS: AccessLevel.NONE,
    INVENTARIO: AccessLevel.NONE, VENTAS: AccessLevel.NONE,
  },
};