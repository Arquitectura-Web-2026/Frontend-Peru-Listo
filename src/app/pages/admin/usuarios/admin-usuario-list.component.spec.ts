import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AdminUsuarioListComponent } from './admin-usuario-list.component';
import { AdminService } from '../../../services/admin.service';
import { AdminUsuarioDTO } from '../../../models/admin.models';

describe('AdminUsuarioListComponent', () => {
  let component: AdminUsuarioListComponent;
  let fixture: ComponentFixture<AdminUsuarioListComponent>;
  let adminService: AdminService;
  let httpMock: HttpTestingController;

  const mockUsuarios: AdminUsuarioDTO[] = [
    { id: 1, nombreCompleto: 'Juan Pérez', correo: 'juan@test.com', role: 'ROLE_USER', fechaRegistro: '2026-01-15', totalGastos: 5000, totalIngresos: 8000, totalDeudas: 2000 },
    { id: 2, nombreCompleto: 'María López', correo: 'maria@test.com', role: 'ROLE_ADMIN', fechaRegistro: '2026-02-20', totalGastos: 3000, totalIngresos: 10000, totalDeudas: 0 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsuarioListComponent, NoopAnimationsModule],
      providers: [
        AdminService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsuarioListComponent);
    component = fixture.componentInstance;
    adminService = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);

    adminService.usuarios.set(mockUsuarios);
    adminService.loading.set(false);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // TDD: RED tests

  describe('rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should display page title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Administrar Usuarios');
    });

    it('should render user names in table', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Juan Pérez');
      expect(compiled.textContent).toContain('María López');
    });

    it('should render user emails', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('juan@test.com');
      expect(compiled.textContent).toContain('maria@test.com');
    });

    it('should render roles', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('ROLE_USER');
      expect(compiled.textContent).toContain('ROLE_ADMIN');
    });
  });

  describe('loading state', () => {
    it('should show spinner when loading is true', () => {
      adminService.loading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no users', () => {
      adminService.usuarios.set([]);
      adminService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sin usuarios');
    });
  });
});
