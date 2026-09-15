import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteFiltros, ClienteRequest, ClienteResponse } from '../models/cliente.model';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiMessageResponse } from '../../productos/models/api-message-response.model';

const BASE = `${API_BASE_URL}/api/admin/clientes`;

/**
 * Consume ClienteController.
 *   - listar/obtener/crear/actualizar: ROLE_ADMINISTRACION o ROLE_VENTAS
 *   - activar/desactivar:              SOLO ROLE_ADMINISTRACION
 *
 * El interceptor JWT (auth-interceptor) agrega el header Authorization.
 */
@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);

  listar(filtros: ClienteFiltros = {}): Observable<ClienteResponse[]> {
    let params = new HttpParams();
    if (filtros.activo != null) params = params.set('activo', filtros.activo);
    if (filtros.texto) params = params.set('texto', filtros.texto);
    return this.http.get<ClienteResponse[]>(BASE, { params });
  }

  obtener(id: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${BASE}/${id}`);
  }

  crear(req: ClienteRequest): Observable<ClienteResponse> {
    return this.http.post<ClienteResponse>(BASE, req);
  }

  actualizar(id: number, req: ClienteRequest): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${BASE}/${id}`, req);
  }

  activar(id: number): Observable<ApiMessageResponse> {
    return this.http.patch<ApiMessageResponse>(`${BASE}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<ApiMessageResponse> {
    return this.http.patch<ApiMessageResponse>(`${BASE}/${id}/desactivar`, {});
  }
}
