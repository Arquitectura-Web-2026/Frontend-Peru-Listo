import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

/** Dummy components for routing tests */
@Component({ standalone: true, template: '<p>Login</p>' })
class LoginStubComponent {}

@Component({ standalone: true, template: '<p>Dashboard</p>' })
class DashboardStubComponent {}

describe('authGuard', () => {
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
          { path: 'dashboard', component: DashboardStubComponent, canActivate: [authGuard] },
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

  describe('navigation protection', () => {
    it('should allow navigation when user is authenticated', async () => {
      authService.isAuthenticated.set(true);

      const result = await router.navigate(['/dashboard']);

      expect(result).toBeTrue();
      expect(location.path()).toBe('/dashboard');
    });

    it('should redirect to /login when user is NOT authenticated', async () => {
      authService.isAuthenticated.set(false);

      const result = await router.navigate(['/dashboard']);

      expect(result).toBeTrue(); // navigation to /login succeeds
      expect(location.path()).toBe('/login');
    });

    it('should redirect to /login when no token in localStorage', async () => {
      // Fresh state — no token, no signals set
      authService.isAuthenticated.set(false);

      await router.navigate(['/dashboard']);
      expect(location.path()).toBe('/login');
    });

    it('should allow /login without authentication', async () => {
      authService.isAuthenticated.set(false);

      await router.navigate(['/login']);
      expect(location.path()).toBe('/login');
    });
  });
});
