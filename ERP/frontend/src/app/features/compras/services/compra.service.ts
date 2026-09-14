import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import {
  CompraFiltros,
  CompraRequest,
  CompraResponse,
  CompraResumenResponse,
  EstadoCompra,
} from '../models/compra.model';

const BASE = `${API_BASE_URL}/api/admin/compras`;

/**
 * Consume CompraController.
 *   - listar/obtener:   ROLE_ADMINISTRACION o ROLE_COMPRAS
 *   - registrar:        SOLO ROLE_COMPRAS
 *   - cambiarEstado:    SOLO ROLE_COMPRAS
 */
@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly http = inject(HttpClient);

  listar(filtros: CompraFiltros = {}): Observable<CompraResumenResponse[]> {
    let params = new HttpParams();
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.proveedorId != null) params = params.set('proveedorId', filtros.proveedorId);
    return this.http.get<CompraResumenResponse[]>(BASE, { params });
  }

  obtener(id: number): Observable<CompraResponse> {
    return this.http.get<CompraResponse>(`${BASE}/${id}`);
  }

  registrar(req: CompraRequest): Observable<CompraResponse> {
    return this.http.post<CompraResponse>(BASE, req);
  }

  cambiarEstado(id: number, estado: EstadoCompra): Observable<CompraResponse> {
    return this.http.patch<CompraResponse>(`${BASE}/${id}/estado`, { estado });
  }
}