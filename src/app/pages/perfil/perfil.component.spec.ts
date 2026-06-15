import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilComponent } from './perfil.component';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { UsuarioDTO } from '../../models/usuario.models';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let usuarioService: UsuarioService;
  let httpMock: HttpTestingController;

  const mockUsuario: UsuarioDTO = {
    id: 1,
    nombreCompleto: 'Juan Pérez',
    correo: 'juan@test.com',
    fechaRegistro: '2026-01-15'
  };

  beforeEach(async () => {
    localStorage.setItem('userId', '1');
    localStorage.setItem('correo', 'juan@test.com');

    await TestBed.configureTestingModule({
      imports: [PerfilComponent, NoopAnimationsModule],
      providers: [
        UsuarioService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    usuarioService = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);

    usuarioService.perfil.set(mockUsuario);
    usuarioService.loading.set(false);
    usuarioService.error.set(null);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should display title "Perfil"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Perfil');
    });

    it('should display user name and email', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Juan Pérez');
      expect(compiled.textContent).toContain('juan@test.com');
    });

    it('should have profile and password sections', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Cambiar Contraseña');
    });
  });

  describe('loading state', () => {
    it('should show loading spinner', () => {
      usuarioService.loading.set(true);
      usuarioService.perfil.set(null);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });
  });

  describe('profile form', () => {
    it('should require nombreCompleto', () => {
      const ctrl = component.profileForm.get('nombreCompleto');
      ctrl?.setValue('');
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
    });
  });

  describe('password form', () => {
    it('should validate password minimum length', () => {
      const ctrl = component.passwordForm.get('newPassword');
      ctrl?.setValue('123');
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
    });

    it('should be valid with correct passwords', () => {
      component.passwordForm.patchValue({
        currentPassword: 'old123',
        newPassword: 'new456',
        confirmPassword: 'new456'
      });
      expect(component.passwordForm.valid).toBeTrue();
    });
  });
});
