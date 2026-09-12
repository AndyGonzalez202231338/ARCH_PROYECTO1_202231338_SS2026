import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionKey } from '../permissions/permission.model';

/**
 * Protege una ruta hija según el rol del usuario autenticado.
 * Se usa junto a authGuard, no en su lugar: authGuard exige sesión,
 * roleGuard exige que el rol esté en route.data['roles'].
 */
export const roleGuard: CanActivateFn = (route) => {
  const permissions = inject(PermissionsService);
  const router = inject(Router);

  const key = route.data['permission'] as PermissionKey | undefined;

  // Si la ruta no declara `permission`, se asume visible para cualquier autenticado
  if (!key) return true;

  return permissions.hasAccess(key) ? true : router.createUrlTree(['/dashboard']);
};