import { Injectable, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AccessLevel, PermissionKey, Role } from './permission.model';
import { PERMISSIONS_MATRIX } from './permissions.config';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private readonly auth = inject(AuthService);

  /** Nivel de acceso del rol actual para un permiso dado. */
  accessLevel(key: PermissionKey): AccessLevel {
    const role = this.auth.getRole() as Role | null;
    if (!role) return AccessLevel.NONE;
    return PERMISSIONS_MATRIX[key]?.[role] ?? AccessLevel.NONE;
  }

  /** true si el rol actual puede ENTRAR a la pantalla (READ o FULL). */
  hasAccess(key: PermissionKey): boolean {
    return this.accessLevel(key) !== AccessLevel.NONE;
  }

  /** true si el rol actual puede crear/editar/eliminar (para ocultar botones dentro de la página). */
  canWrite(key: PermissionKey): boolean {
    return this.accessLevel(key) === AccessLevel.FULL;
  }
}