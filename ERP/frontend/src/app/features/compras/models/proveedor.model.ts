/**
 * NOTA: los campos exactos de ProveedorResponse/ProveedorRequest no se
 * compartieron en esta sesión (solo el controller). Se infirieron de la
 * especificación del módulo de Compras ("mostrar NIT y teléfono",
 * "Nombre, NIT, teléfono, email, dirección"). Ajusta los campos si el
 * DTO real del backend difiere.
 */
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
