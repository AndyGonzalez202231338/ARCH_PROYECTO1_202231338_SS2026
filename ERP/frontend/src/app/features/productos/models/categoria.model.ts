export interface CategoriaResponse {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface CategoriaRequest {
  nombre: string;
  descripcion?: string;
}