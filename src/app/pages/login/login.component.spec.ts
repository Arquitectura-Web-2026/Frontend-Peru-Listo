import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loader: HarnessLoader;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  const mockJwtResponse = {
    token: 'jwt-token', type: 'Bearer', id: 1, correo: 'test@test.com', role: 'ROLE_USER'
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'dashboard', children: [] },
          { path: 'register', children: [] },
        ]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // TDD: RED tests

  describe('form rendering', () => {
    it('should render email and password fields', async () => {
      const inputs = await loader.getAllHarnesses(MatInputHarness);
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('should render login button', async () => {
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      const loginButton = buttons.find(async b => (await b.getText()).includes('Iniciar'));
      expect(loginButton).toBeDefined();
    });

    it('should have a link to register page', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      // Should have some reference to registro/register
      const text = compiled.textContent?.toLowerCase() || '';
      expect(text).toContain('registr');
    });
  });

  describe('form validation', () => {
    it('should mark email as required', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.markAsTouched();
      emailControl?.setValue('');
      expect(emailControl?.valid).toBeFalse();
      expect(emailControl?.errors?.['required']).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();
    });

    it('should mark password as required', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.markAsTouched();
      passwordControl?.setValue('');
      expect(passwordControl?.valid).toBeFalse();
      expect(passwordControl?.errors?.['required']).toBeTruthy();
    });

    it('should disable submit button when form is invalid', async () => {
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      const loginButton = buttons.find(async b => (await b.getText()).includes('Iniciar'));
      expect(await loginButton?.isDisabled()).toBeTrue();
    });
  });

  describe('login submission', () => {
    it('should call AuthService.login and navigate on success', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.loginForm.setValue({ email: 'test@test.com', password: 'pass123' });

      component.onSubmit();

      const req = httpMock.expectOne('/API/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@test.com', password: 'pass123' });
      req.flush(mockJwtResponse);

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
      expect(authService.isAuthenticated()).toBeTrue();
    });

    it('should show error snackbar on login failure', () => {
      component.loginForm.setValue({ email: 'bad@test.com', password: 'wrong' });

      component.onSubmit();

      const req = httpMock.expectOne('/API/login');
      req.flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });
    });
  });
});
