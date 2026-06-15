import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let loader: HarnessLoader;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, NoopAnimationsModule],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', children: [] },
        ]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // TDD: RED tests

  describe('form rendering', () => {
    it('should render all required fields', async () => {
      const inputs = await loader.getAllHarnesses(MatInputHarness);
      expect(inputs.length).toBeGreaterThanOrEqual(3); // nombreCompleto, email, password at minimum
    });

    it('should render register button', async () => {
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      const registerButton = buttons.find(async b => (await b.getText()).includes('Registr'));
      expect(registerButton).toBeDefined();
    });

    it('should have a link to login page', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const text = compiled.textContent?.toLowerCase() || '';
      expect(text).toContain('iniciar');
    });
  });

  describe('form validation', () => {
    it('should require nombreCompleto', () => {
      const control = component.registerForm.get('nombreCompleto');
      control?.markAsTouched();
      control?.setValue('');
      expect(control?.valid).toBeFalse();
    });

    it('should require email and validate format', () => {
      const control = component.registerForm.get('email');
      control?.setValue('bad-email');
      expect(control?.errors?.['email']).toBeTruthy();
    });

    it('should require password with minimum length', () => {
      const control = component.registerForm.get('password');
      control?.setValue('12');
      expect(control?.valid).toBeFalse();
      control?.setValue('123456');
      expect(control?.valid).toBeTrue();
    });

    it('should validate password confirmation match', () => {
      component.registerForm.setValue({
        nombreCompleto: 'Test User',
        email: 'test@test.com',
        password: '123456',
        confirmPassword: 'different'
      });
      expect(component.registerForm.errors?.['mismatch']).toBeTruthy();

      component.registerForm.patchValue({ confirmPassword: '123456' });
      expect(component.registerForm.errors?.['mismatch']).toBeFalsy();
    });

    it('should disable submit button when form is invalid', async () => {
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      const registerButton = buttons.find(async b => (await b.getText()).includes('Registr'));
      expect(await registerButton?.isDisabled()).toBeTrue();
    });
  });

  describe('registration submission', () => {
    it('should call AuthService.register and navigate to /login on success', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.registerForm.setValue({
        nombreCompleto: 'Test User',
        email: 'new@test.com',
        password: 'pass123',
        confirmPassword: 'pass123'
      });

      component.onSubmit();

      const req = httpMock.expectOne('/API/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'new@test.com', password: 'pass123' });
      req.flush({ message: 'Usuario registrado exitosamente' });

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
