import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api.config';
import { ApiMessageResponse } from '../models/api-message-response.model';
import { UsuarioFiltros, UsuarioRequest, UsuarioResponse } from '../models/usuario.model';

const BASE = `${API_BASE_URL}/api/admin/usuarios`;

/**
 * Consume AdminUsuarioController (protegido con ROLE_ADMINISTRACION).
 */
@Injectable({ providedIn: 'root' })
export class AdminUsuarioService {
  private readonly http = inject(HttpClient);
  /**
   * Lista los usuarios según los filtros proporcionados.
   * @param filtros Filtros para la consulta.
   * @returns Observable con la lista de usuarios.
   */
  listar(filtros: UsuarioFiltros = {}): Observable<UsuarioResponse[]> {
    let params = new HttpParams();
    if (filtros.texto) params = params.set('texto', filtros.texto);
    if (filtros.areaId != null) params = params.set('areaId', filtros.areaId);
    if (filtros.activo != null) params = params.set('activo', filtros.activo);
    return this.http.get<UsuarioResponse[]>(BASE, { params });
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id ID del usuario a obtener.
   * @returns Observable con el usuario encontrado.
   */
  obtener(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${BASE}/${id}`);
  }
  /**
   * Crea un nuevo usuario.
   * @param req Datos del usuario a crear.
   * @returns Observable con el usuario creado.
   */
  crear(req: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(BASE, req);
  }

  /**
   * actualiza un usuario existente.
   * @param id 
   * @param req 
   * @returns 
   */
  actualizar(id: number, req: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${BASE}/${id}`, req);
  }

  cambiarPassword(id: number, password: string): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${BASE}/${id}/password`, { password });
  }

  activar(id: number): Observable<ApiMessageResponse> {
    return this.http.patch<ApiMessageResponse>(`${BASE}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<ApiMessageResponse> {
    return this.http.patch<ApiMessageResponse>(`${BASE}/${id}/desactivar`, {});
  }
}