export type AreaNombre = 'ADMINISTRACION' | 'COMPRAS' | 'VENTAS' | 'INVENTARIO';

export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  areaId: number;
  areaNombre: AreaNombre;
  activo: boolean;
  fechaCreacion?: string;
}

export interface UsuarioRequest {
  nombre: string;
  email: string;
  password?: string;
  areaId: number;
  activo?: boolean;
}

export interface UsuarioFiltros {
  texto?: string;
  areaId?: number;
  activo?: boolean;
}
