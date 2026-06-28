import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Route guard that checks if the user has admin role.
 * - If authenticated AND admin: allows navigation.
 * - If authenticated but NOT admin: redirects to /dashboard.
 * - If NOT authenticated: redirects to /login.
 *
 * Used as: `canActivate: [adminGuard]` on admin routes.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  return authService.isAuthenticated()
    ? router.parseUrl('/dashboard')
    : router.parseUrl('/login');
};
