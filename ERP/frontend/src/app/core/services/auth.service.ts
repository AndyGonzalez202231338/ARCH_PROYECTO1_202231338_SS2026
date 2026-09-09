import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { Usuario } from '../models/usuario.model';

const API_URL = 'http://localhost:8080';
const TOKEN_KEY = 'minierp_token';
const USER_KEY = 'minierp_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly token = signal<string | null>(this.readToken());
  private readonly user = signal<Usuario | null>(this.readUser());

  readonly currentUser = this.user.asReadonly();
  readonly isAuthenticated = computed(() => this.token() !== null);
  /**
   * Inicia sesión con las credenciales proporcionadas.
   * @param request Los datos de inicio de sesión.
   * @returns Un observable que emite la respuesta del servidor.
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/api/auth/login`, request).pipe(
      tap((response) => {
        const user: Usuario = { email: response.email, rol: response.rol };
        this.token.set(response.token);
        this.user.set(user);
        if (this.browser) {
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      })
    );
  }

  getToken(): string | null { return this.token(); }
  getRole(): string | null { return this.user()?.rol ?? null; }

  /**
   * Cierra la sesión del usuario, eliminando el token y la información del usuario del almacenamiento local y de las señales.
   * Si la aplicación se está ejecutando en un navegador, también elimina los elementos del almacenamiento local.
   * Esto asegura que el usuario ya no esté autenticado y que la información sensible se elimine de manera segura.
   * 
   * @returns void
   */
  logout(): void {
    this.token.set(null);
    this.user.set(null);
    if (this.browser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
  /**
   * Lee el token del almacenamiento local.
   * @returns El token o null si no se encuentra.
   */
  private readToken(): string | null {
    return this.browser ? localStorage.getItem(TOKEN_KEY) : null;
  }

  /**
   * Lee el usuario del almacenamiento local.
   * @returns El usuario o null si no se encuentra.
   */
  private readUser(): Usuario | null {
    if (!this.browser) return null;
    const value = localStorage.getItem(USER_KEY);
    if (!value) return null;
    try { return JSON.parse(value) as Usuario; }
    catch { localStorage.removeItem(USER_KEY); return null; }
  }
}