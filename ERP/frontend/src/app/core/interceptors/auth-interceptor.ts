import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const LOGIN_URL = 'http://localhost:8080/api/auth/login';

/** 
 * Interceptor de autenticación que agrega el token JWT a las solicitudes HTTP y maneja errores de autenticación.
*/
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  const loginRequest = req.url === LOGIN_URL;
  const request = token && !loginRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(request).pipe(catchError((error) => {
    if (error.status === 401 && !loginRequest) {
      auth.logout();
      void router.navigate(['/login']);
    }
    return throwError(() => error);
  }));
};
