import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { JwtResponse } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockJwtResponse: JwtResponse = {
    token: 'eyJ.test.token',
    type: 'Bearer',
    id: 1,
    correo: 'test@test.com',
    role: 'ROLE_USER'
  };

  const mockAdminJwtResponse: JwtResponse = {
    token: 'eyJ.admin.token',
    type: 'Bearer',
    id: 2,
    correo: 'admin@test.com',
    role: 'ROLE_ADMIN'
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // TDD: RED — tests written before implementation

  describe('login', () => {
    it('should call POST /API/login and store JWT in localStorage', () => {
      service.login('test@test.com', 'password123').subscribe(response => {
        expect(response.token).toBe('eyJ.test.token');
        expect(response.id).toBe(1);
        expect(response.correo).toBe('test@test.com');
      });

      const req = httpMock.expectOne('/API/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@test.com', password: 'password123' });
      req.flush(mockJwtResponse);

      expect(localStorage.getItem('token')).toBe('eyJ.test.token');
      expect(localStorage.getItem('userId')).toBe('1');
      expect(localStorage.getItem('correo')).toBe('test@test.com');
    });

    it('should set signal state after successful login', () => {
      service.login('user@test.com', 'pass').subscribe();

      const req = httpMock.expectOne('/API/login');
      req.flush(mockJwtResponse);

      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUserId()).toBe(1);
      expect(service.currentUserEmail()).toBe('test@test.com');
    });

    it('should store role in localStorage on successful login', () => {
      service.login('user@test.com', 'pass').subscribe();

      const req = httpMock.expectOne('/API/login');
      req.flush(mockJwtResponse);

      expect(localStorage.getItem('role')).toBe('ROLE_USER');
      expect(service.currentUserRole()).toBe('ROLE_USER');
    });

    it('should store ROLE_ADMIN in localStorage for admin user', () => {
      service.login('admin@test.com', 'adminpass').subscribe();

      const req = httpMock.expectOne('/API/login');
      req.flush(mockAdminJwtResponse);

      expect(localStorage.getItem('role')).toBe('ROLE_ADMIN');
      expect(service.currentUserRole()).toBe('ROLE_ADMIN');
    });

    it('should pass through errors on login failure', () => {
      let errorMessage = '';
      service.login('bad@test.com', 'wrong').subscribe({
        error: (err) => { errorMessage = err.error?.message || err.message; }
      });

      const req = httpMock.expectOne('/API/login');
      req.flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });

      expect(errorMessage).toBe('Credenciales inválidas');
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('register', () => {
    it('should call POST /API/register with email and password', () => {
      service.register('Test User', 'new@test.com', 'pass123').subscribe(response => {
        expect(response.message).toBe('Usuario registrado exitosamente');
      });

      const req = httpMock.expectOne('/API/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'new@test.com', password: 'pass123' });
      req.flush({ message: 'Usuario registrado exitosamente' });
    });
  });

  describe('logout', () => {
    it('should clear localStorage and reset signals', () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('userId', '5');
      localStorage.setItem('correo', 'u@test.com');
      localStorage.setItem('role', 'ROLE_USER');
      service.isAuthenticated.set(true);
      service.currentUserId.set(5);
      service.currentUserEmail.set('u@test.com');
      service.currentUserRole.set('ROLE_USER');

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
      expect(localStorage.getItem('correo')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.currentUserId()).toBeNull();
      expect(service.currentUserEmail()).toBeNull();
      expect(service.currentUserRole()).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'my-token');
      expect(service.getToken()).toBe('my-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getUserId', () => {
    it('should return userId from localStorage as number', () => {
      localStorage.setItem('userId', '42');
      expect(service.getUserId()).toBe(42);
    });

    it('should return null when no userId exists', () => {
      expect(service.getUserId()).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'exists');
      const newService = new AuthService(TestBed.inject(HttpTestingController) as any);
      // Re-test with signal that reads localStorage
      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('isAuthenticated signal initialization', () => {
    it('should be true when token exists in localStorage at initialization', () => {
      localStorage.setItem('token', 'existing-token');
      localStorage.setItem('userId', '10');
      localStorage.setItem('correo', 'existing@test.com');

      // create fresh service instance with token in storage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
        ]
      });
      const freshService = TestBed.inject(AuthService);
      const freshHttpMock = TestBed.inject(HttpTestingController);

      expect(freshService.isAuthenticated()).toBeTrue();
      expect(freshService.currentUserId()).toBe(10);
      expect(freshService.currentUserEmail()).toBe('existing@test.com');

      freshHttpMock.verify();
    });

    it('should initialize currentUserRole from localStorage', () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('userId', '1');
      localStorage.setItem('correo', 'u@test.com');
      localStorage.setItem('role', 'ROLE_ADMIN');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
        ]
      });
      const freshService = TestBed.inject(AuthService);
      const freshHttpMock = TestBed.inject(HttpTestingController);

      expect(freshService.currentUserRole()).toBe('ROLE_ADMIN');

      freshHttpMock.verify();
    });
  });

  describe('isAdmin', () => {
    it('should return true when currentUserRole is ROLE_ADMIN', () => {
      service.currentUserRole.set('ROLE_ADMIN');
      expect(service.isAdmin()).toBeTrue();
    });

    it('should return false when currentUserRole is ROLE_USER', () => {
      service.currentUserRole.set('ROLE_USER');
      expect(service.isAdmin()).toBeFalse();
    });

    it('should return false when currentUserRole is null', () => {
      service.currentUserRole.set(null);
      expect(service.isAdmin()).toBeFalse();
    });
  });

  describe('currentUserRole', () => {
    it('should be null initially when no role in localStorage', () => {
      expect(service.currentUserRole()).toBeNull();
    });

    it('should reflect set value', () => {
      service.currentUserRole.set('ROLE_ADMIN');
      expect(service.currentUserRole()).toBe('ROLE_ADMIN');
    });
  });
});
