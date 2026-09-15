import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import {
  VentaFiltros,
  VentaRequest,
  VentaResponse,
  VentaResumenResponse,
} from '../models/venta.model';

const BASE = `${API_BASE_URL}/api/admin/ventas`;

/**
 * Consume VentaController.
 *   - listar/obtener:      ROLE_ADMINISTRACION o ROLE_VENTAS
 *   - registrar:           SOLO ROLE_VENTAS
 *   - descargarFactura:    ROLE_ADMINISTRACION o ROLE_VENTAS
 *
 * El interceptor JWT (auth-interceptor) agrega el header Authorization.
 */
@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly http = inject(HttpClient);

  listar(filtros: VentaFiltros = {}): Observable<VentaResumenResponse[]> {
    let params = new HttpParams();
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.clienteId != null) params = params.set('clienteId', filtros.clienteId);
    return this.http.get<VentaResumenResponse[]>(BASE, { params });
  }

  obtener(id: number): Observable<VentaResponse> {
    return this.http.get<VentaResponse>(`${BASE}/${id}`);
  }

  registrar(req: VentaRequest): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(BASE, req);
  }

  /** Devuelve el PDF binario de la factura. */
  descargarFactura(id: number): Observable<Blob> {
    return this.http.get(`${BASE}/${id}/factura`, { responseType: 'blob' });
  }
}
