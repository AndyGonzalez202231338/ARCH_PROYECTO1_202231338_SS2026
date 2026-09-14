import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ProveedorResponse } from '../models/proveedor.model';


const BASE = `${API_BASE_URL}/api/admin/proveedores`;

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private readonly http = inject(HttpClient);

  listar(activo?: boolean, texto?: string): Observable<ProveedorResponse[]> {
    let params = new HttpParams();
    if (activo != null) params = params.set('activo', activo);
    if (texto) params = params.set('texto', texto);
    return this.http.get<ProveedorResponse[]>(BASE, { params });
  }

  obtener(id: number): Observable<ProveedorResponse> {
    return this.http.get<ProveedorResponse>(`${BASE}/${id}`);
  }
}