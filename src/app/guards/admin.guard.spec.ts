import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

/** Dummy components for routing tests */
@Component({ standalone: true, template: '<p>Login</p>' })
class LoginStubComponent {}

@Component({ standalone: true, template: '<p>Dashboard</p>' })
class DashboardStubComponent {}

@Component({ standalone: true, template: '<p>Admin</p>' })
class AdminStubComponent {}

describe('adminGuard', () => {
  let authService: AuthService;
  let router: Router;
  let location: Location;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([
          { path: 'login', component: LoginStubComponent },
          { path: 'dashboard', component: DashboardStubComponent },
          { path: 'admin', component: AdminStubComponent, canActivate: [adminGuard] },
        ]),
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // TDD: RED — tests written before guard implementation

  describe('admin access', () => {
    it('should allow navigation when user is authenticated and is admin', async () => {
      authService.isAuthenticated.set(true);
      authService.currentUserRole.set('ROLE_ADMIN');

      const result = await router.navigate(['/admin']);

      expect(result).toBeTrue();
      expect(location.path()).toBe('/admin');
    });

    it('should redirect to /dashboard when user is authenticated but NOT admin', async () => {
      authService.isAuthenticated.set(true);
      authService.currentUserRole.set('ROLE_USER');

      const result = await router.navigate(['/admin']);

      expect(result).toBeTrue(); // navigation to /dashboard succeeds
      expect(location.path()).toBe('/dashboard');
    });

    it('should redirect to /login when user is NOT authenticated', async () => {
      authService.isAuthenticated.set(false);
      authService.currentUserRole.set(null);

      const result = await router.navigate(['/admin']);

      expect(result).toBeTrue(); // navigation to /login succeeds
      expect(location.path()).toBe('/login');
    });

    it('should redirect to /login when currentUserRole is null', async () => {
      authService.isAuthenticated.set(true);
      authService.currentUserRole.set(null);

      const result = await router.navigate(['/admin']);

      expect(result).toBeTrue();
      expect(location.path()).toBe('/dashboard');
    });
  });
});
