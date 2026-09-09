import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
/**
 * Guardia de autenticación para proteger las rutas de la aplicación.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (route.data['publicOnly'] === true) {
    return auth.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
  }
  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
