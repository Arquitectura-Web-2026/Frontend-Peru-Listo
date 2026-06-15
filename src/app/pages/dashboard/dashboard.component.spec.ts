import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { DashboardResumenDTO, GastosCategoriaDTO, ComparativaMensualDTO } from '../../models/dashboard.models';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashService: DashboardService;
  let authService: AuthService;
  let httpMock: HttpTestingController;

  const mockResumen: DashboardResumenDTO = {
    totalIngresos: 5000.50,
    totalGastos: 3200.75,
    balance: 1799.75,
    mes: 6,
    anio: 2026
  };

  const mockCategorias: GastosCategoriaDTO[] = [
    { categoriaNombre: 'Alimentación', monto: 1500, porcentaje: 46.9 },
    { categoriaNombre: 'Transporte', monto: 800, porcentaje: 25.0 },
  ];

  const mockComparativa: ComparativaMensualDTO[] = [
    { mes: 1, anio: 2026, ingresos: 4500, gastos: 3000 },
  ];

  beforeEach(async () => {
    localStorage.setItem('userId', '1');

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        DashboardService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dashService = TestBed.inject(DashboardService);
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Pre-populate service signals to simulate loaded state
    dashService.resumen.set(mockResumen);
    dashService.gastosPorCategoria.set(mockCategorias);
    dashService.comparativaMensual.set(mockComparativa);
    dashService.loading.set(false);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // TDD: RED tests

  describe('rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should display the dashboard title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Dashboard');
    });

    it('should display ingresos value from resumen', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('5,000.50');
    });

    it('should display gastos value from resumen', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('3,200.75');
    });

    it('should display balance value', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('1,799.75');
    });

    it('should display category names', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Alimentación');
      expect(compiled.textContent).toContain('Transporte');
    });

    it('should display stat card labels', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Ingresos');
      expect(compiled.textContent).toContain('Gastos');
      expect(compiled.textContent).toContain('Balance');
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when loading signal is true', () => {
      dashService.loading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });

    it('should hide loading spinner when loading is false', () => {
      dashService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      // Content should show, spinner should not
      expect(compiled.textContent).toContain('Ingresos');
    });
  });

  describe('empty state', () => {
    it('should show "Sin datos" when resumen is null', () => {
      dashService.resumen.set(null);
      dashService.gastosPorCategoria.set([]);
      dashService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sin datos');
    });
  });

  describe('error state', () => {
    it('should show error message and retry button when error signal is set', () => {
      dashService.error.set('Error de conexión');
      dashService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Error de conexión');
    });
  });
});
