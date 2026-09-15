import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { StockProductoResponse } from '../models/venta.model';

const BASE = `${API_BASE_URL}/api/admin/inventario`;

/**
 * Consume InventarioController. GET /stock es isAuthenticated(), así que
 * cualquier rol autenticado puede leer el stock actual.
 * Solo se implementa lo que necesita Ventas (validación de stock).
 */
@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);

  listarStock(): Observable<StockProductoResponse[]> {
    return this.http.get<StockProductoResponse[]>(`${BASE}/stock`);
  }
}
