import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { CompraResumenResponse } from '../models/compra.model';

const BASE = `${API_BASE_URL}/api/admin/compras`;

/**
 * Consume CompraController (solo ADMINISTRACION/COMPRAS, igual que Proveedores).
 * Se usa únicamente para listar las compras de un proveedor en su detalle.
 */
@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly http = inject(HttpClient);

  listarPorProveedor(proveedorId: number): Observable<CompraResumenResponse[]> {
    const params = new HttpParams().set('proveedorId', proveedorId);
    return this.http.get<CompraResumenResponse[]>(BASE, { params });
  }
}
