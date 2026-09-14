import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiMessageResponse } from '../models/api-message-response.model';
import { ProductoFiltros, ProductoRequest, ProductoResponse } from '../models/producto.model';

const BASE = `${API_BASE_URL}/api/admin/productos`;

/**
 * Consume ProductoController (lectura para cualquier autenticado,
 * escritura restringida a ADMINISTRACION/INVENTARIO según el backend).
 */
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);

  /**
   * Lista los productos según los filtros proporcionados.
   * @param filtros Filtros para la consulta.
   * @returns Observable con la lista de productos.
   */
  listar(filtros: ProductoFiltros = {}): Observable<ProductoResponse[]> {
    let params = new HttpParams();
    if (filtros.categoriaId != null) params = params.set('categoriaId', filtros.categoriaId);
    if (filtros.activo != null) params = params.set('activo', filtros.activo);
    if (filtros.texto) params = params.set('texto', filtros.texto);
    return this.http.get<ProductoResponse[]>(BASE, { params });
  }

  /**
   * Obtiene un producto por su ID.
   * @param id ID del producto a obtener.
   * @returns Observable con el producto encontrado.
   */
  obtener(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${BASE}/${id}`);
  }

  /**
   * Crea un nuevo producto.
   * @param req Datos del producto a crear.
   * @returns Observable con el producto creado.
   */
  crear(req: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(BASE, req);
  }

  /**
   * Actualiza un producto existente.
   * @param id ID del producto a actualizar.
   * @param req Datos a actualizar.
   * @returns Observable con el producto actualizado.
   */
  actualizar(id: number, req: ProductoRequest): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${BASE}/${id}`, req);
  }

  activar(id: number): Observable<ApiMessageResponse> {
    return this.http.patch<ApiMessageResponse>(`${BASE}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<ApiMessageResponse> {
    return this.http.patch<ApiMessageResponse>(`${BASE}/${id}/desactivar`, {});
  }
}
