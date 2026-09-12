import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioMe } from '../models/usuario-me.model';

const API_URL = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);

  /** Consulta los datos del usuario autenticado actualmente. */
  getMe(): Observable<UsuarioMe> {
    return this.http.get<UsuarioMe>(`${API_URL}/api/usuarios/me`);
  }
}