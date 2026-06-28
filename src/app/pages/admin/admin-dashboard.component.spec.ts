import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminService } from '../../services/admin.service';
import { AdminDashboardDTO, AdminUsuarioDTO } from '../../models/admin.models';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let adminService: AdminService;
  let httpMock: HttpTestingController;

  const mockDashboard: AdminDashboardDTO = {
    totalUsuarios: 150,
    usuariosNuevosEsteMes: 12,
    totalTransacciones: 2340,
    totalGastosSistema: 45000.50,
    totalIngresosSistema: 67000.75,
    totalDeudasPendientes: 12000,
    totalMetasAhorro: 85
  };

  const mockUsuarios: AdminUsuarioDTO[] = [
    { id: 1, nombreCompleto: 'Juan', correo: 'juan@test.com', role: 'ROLE_USER', fechaRegistro: '2026-01-15', totalGastos: 5000, totalIngresos: 8000, totalDeudas: 2000 },
    { id: 2, nombreCompleto: 'Ana', correo: 'ana@test.com', role: 'ROLE_USER', fechaRegistro: '2026-03-10', totalGastos: 3000, totalIngresos: 6000, totalDeudas: 500 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent, NoopAnimationsModule],
      providers: [
        AdminService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    adminService = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);

    // Pre-populate signals for rendering tests
    adminService.dashboard.set(mockDashboard);
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

    it('should display admin dashboard title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Panel de Administración');
    });

    it('should display total usuarios stat', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('150');
      expect(compiled.textContent).toContain('Total Usuarios');
    });

    it('should display usuarios nuevos este mes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('12');
      expect(compiled.textContent).toContain('Nuevos este mes');
    });

    it('should display total transacciones', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('2,340');
      expect(compiled.textContent).toContain('Transacciones');
    });

    it('should display deudas pendientes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('12,000');
      expect(compiled.textContent).toContain('Deudas Pendientes');
    });

    it('should display metas de ahorro', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('85');
      expect(compiled.textContent).toContain('Metas de Ahorro');
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
    it('should show empty message when dashboard is null', () => {
      adminService.dashboard.set(null);
      adminService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sin datos');
    });
  });
});
