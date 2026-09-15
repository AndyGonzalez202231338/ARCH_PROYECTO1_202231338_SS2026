export const TIPOS_DOCUMENTO = ['CC', 'NIT', 'CE', 'PAS'] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export interface ClienteResponse {
  id: number;
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  email: string;
  direccion: string;
  activo: boolean;
}

export interface ClienteRequest {
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo?: boolean;
}

export interface ClienteFiltros {
  activo?: boolean;
  texto?: string;
}
