import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';


import { API_BASE_URL } from '../../../core/config/api.config';
import { ProductoFiltros, ProductoResponse } from '../../productos/models/producto.model';

const BASE = `${API_BASE_URL}/api/admin/productos`;

/**
 * Consume ProductoController (GET es isAuthenticated(), cualquier rol).
 * Solo se implementan listar/obtener aquí porque es lo que necesita el
 * módulo de Compras (selector de productos activos).
 */
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);

  listar(filtros: ProductoFiltros = {}): Observable<ProductoResponse[]> {
    let params = new HttpParams();
    if (filtros.categoriaId != null) params = params.set('categoriaId', filtros.categoriaId);
    if (filtros.activo != null) params = params.set('activo', filtros.activo);
    if (filtros.texto) params = params.set('texto', filtros.texto);
    return this.http.get<ProductoResponse[]>(BASE, { params });
  }

  obtener(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${BASE}/${id}`);
  }
}
