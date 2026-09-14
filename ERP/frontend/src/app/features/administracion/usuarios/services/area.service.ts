import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api.config';
import { AreaResponse } from '../models/area.model';

const BASE = `${API_BASE_URL}/api/admin/areas`;

/**
 * Consume AreaController (protegido con ROLE_ADMINISTRACION).
 */
@Injectable({ providedIn: 'root' })
export class AreaService {
  private readonly http = inject(HttpClient);

  listar(): Observable<AreaResponse[]> {
    return this.http.get<AreaResponse[]>(BASE);
  }
}