import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiMessageResponse } from '../models/api-message-response.model';
import { ProveedorFiltros, ProveedorRequest, ProveedorResponse } from '../models/proveedor.model';

const BASE = `${API_BASE_URL}/api/admin/proveedores`;

/**
 * Consume ProveedorController.
 * Lectura y escritura: ADMINISTRACION + COMPRAS (según @PreAuthorize del backend).
 * Activar/desactivar: solo ADMINISTRACION (restringido también en el backend).
 */
@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private readonly http = inject(HttpClient);

  /**
   * Lista los proveedores según los filtros proporcionados.
   * @param filtros Filtros para la consulta.
   * @returns Observable con la lista de proveedores.
   */
  listar(filtros: ProveedorFiltros = {}): Observable<ProveedorResponse[]> {
    let params = new HttpParams();
    if (filtros.activo != null) params = params.set('activo', filtros.activo);
    if (filtros.texto) params = params.set('texto', filtros.texto);
    return this.http.get<ProveedorResponse[]>(BASE, { params });
  }

  /**
   * Obtiene un proveedor por su ID.
   * @param id ID del proveedor a obtener.
   * @returns Observable con el proveedor encontrado.
   */
  obtener(id: number): Observable<ProveedorResponse> {
    return this.http.get<ProveedorResponse>(`${BASE}/${id}`);
  }

  /**
   * Crea un nuevo proveedor.
   * @param req Datos del proveedor a crear.
   * @returns Observable con el proveedor creado.
   */
  crear(req: ProveedorRequest): Observable<ProveedorResponse> {
    return this.http.post<ProveedorResponse>(BASE, req);
  }

  /**
   * Actualiza un proveedor existente.
   * @param id ID del proveedor a actualizar.
   * @param req Datos a actualizar.
   * @returns Observable con el proveedor actualizado.
   */
  actualizar(id: number, req: ProveedorRequest): Observable<ProveedorResponse> {
    return this.http.put<ProveedorResponse>(`${BASE}/${id}`, req);
  }

  activar(id: number): Observable<ApiMessageResponse> {
    return this.http.patch<ApiMessageResponse>(`${BASE}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<ApiMessageResponse> {
    return this.http.patch<ApiMessageResponse>(`${BASE}/${id}/desactivar`, {});
  }
}
