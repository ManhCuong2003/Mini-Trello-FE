import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  const authToken = authService.getToken()

  let authReq = req
  if(authReq) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bear ${authToken}`
      }
    })
  }

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          console.error('Functional AuthInterceptor: Received 401 Unauthorized. Logging out and redirecting.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          authService.clearAuthData()
          router.navigate(['/auth/login'], {
            queryParams: { sessionExpired: 'true' }
          });
          return throwError(() => new Error('Phiên làm việc hết hạn hoặc không hợp lệ.'));
        }
      }
      return throwError(() => error);
    })
  )
};
