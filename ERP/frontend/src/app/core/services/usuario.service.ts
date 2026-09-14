import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { UsuarioMe } from '../models/usuario-me.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);

  /** Consulta los datos del usuario autenticado actualmente. */
  getMe(): Observable<UsuarioMe> {
    return this.http.get<UsuarioMe>(`${API_BASE_URL}/api/usuarios/me`);
  }
}