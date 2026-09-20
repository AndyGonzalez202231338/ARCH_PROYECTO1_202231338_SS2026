import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { CategoriaRequest, CategoriaResponse } from '../models/categoria.model';

const BASE = `${API_BASE_URL}/api/admin/categorias`;

/**
 * Consume CategoriaController. Solo se usa el listado (lectura) desde
 * el módulo de Productos; la gestión de categorías no es parte de este alcance.
 */
@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);

  listar(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(BASE);
  }

  crear(req: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.post<CategoriaResponse>(BASE, req);
  }

  actualizar(id: number, req: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.put<CategoriaResponse>(`${BASE}/${id}`, req);
  }
}
