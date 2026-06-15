import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Route guard that checks if the user is authenticated.
 * - If authenticated (token exists in localStorage): allows navigation.
 * - If not authenticated: redirects to /login.
 *
 * Used as: `canActivate: [authGuard]` on all protected routes.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};
