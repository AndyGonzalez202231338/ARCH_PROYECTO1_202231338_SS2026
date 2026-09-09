import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Protege una ruta hija según el rol del usuario autenticado.
 * Se usa junto a authGuard, no en su lugar: authGuard exige sesión,
 * roleGuard exige que el rol esté en route.data['roles'].
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[] | undefined;
  const userRole = auth.getRole();

  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (userRole && allowedRoles.includes(userRole)) return true;

  return router.createUrlTree(['/dashboard']);
};