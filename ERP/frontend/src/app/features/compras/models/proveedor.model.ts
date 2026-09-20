export interface ProveedorResponse {
  id: number;
  nombre: string;
  nit: string;
  telefono: string;
  email?: string;
  direccion?: string;
  activo: boolean;
}

export interface ProveedorRequest {
  nombre: string;
  nit: string;
  telefono: string;
  email?: string;
  direccion?: string;
  activo?: boolean;
}
