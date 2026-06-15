import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { jwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../services/auth.service';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';

/** Dummy component for router testing */
@Component({ standalone: true, template: '' })
class DummyLoginComponent {}

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: DummyLoginComponent },
        ]),
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // TDD: RED — tests written before interceptor implementation

  describe('adding Authorization header', () => {
    it('should add Bearer token when token exists in localStorage', () => {
      localStorage.setItem('token', 'test-jwt-token');

      http.get('/API/dashboard/resumen_mensual').subscribe();

      const req = httpMock.expectOne('/API/dashboard/resumen_mensual');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
      req.flush({});
    });

    it('should NOT add Authorization header when no token exists', () => {
      http.get('/API/dashboard/resumen_mensual').subscribe();

      const req = httpMock.expectOne('/API/dashboard/resumen_mensual');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });

    it('should add token to POST requests as well', () => {
      localStorage.setItem('token', 'jwt-post-token');

      http.post('/API/registrar_gasto', {}).subscribe();

      const req = httpMock.expectOne('/API/registrar_gasto');
      expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-post-token');
      req.flush({});
    });
  });

  describe('handling 401 responses', () => {
    it('should clear localStorage and call authService.logout on 401', () => {
      localStorage.setItem('token', 'expired-token');
      localStorage.setItem('userId', '1');
      authService.isAuthenticated.set(true);
      authService.currentUserId.set(1);

      http.get('/API/gastos').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/API/gastos');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
      expect(authService.isAuthenticated()).toBeFalse();
    });

    it('should NOT clear state for non-401 errors', () => {
      localStorage.setItem('token', 'valid-token');
      authService.isAuthenticated.set(true);

      http.get('/API/gastos').subscribe({
        error: () => { /* expected */ }
      });

      const req = httpMock.expectOne('/API/gastos');
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

      expect(localStorage.getItem('token')).toBe('valid-token');
      expect(authService.isAuthenticated()).toBeTrue();
    });
  });

  describe('passthrough behavior', () => {
    it('should pass through successful responses unchanged', () => {
      localStorage.setItem('token', 'token');

      http.get('/API/data').subscribe(response => {
        expect(response).toEqual({ data: 'ok' });
      });

      const req = httpMock.expectOne('/API/data');
      req.flush({ data: 'ok' });
    });
  });
});
