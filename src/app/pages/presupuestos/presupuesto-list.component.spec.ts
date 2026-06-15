import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresupuestoListComponent } from './presupuesto-list.component';
import { PresupuestoService } from '../../services/presupuesto.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { PresupuestoDTO } from '../../models/presupuesto.models';
import { CategoriaDTO } from '../../models/gasto.models';

describe('PresupuestoListComponent', () => {
  let component: PresupuestoListComponent;
  let fixture: ComponentFixture<PresupuestoListComponent>;
  let presupuestoService: PresupuestoService;
  let categoriaService: CategoriaService;
  let httpMock: HttpTestingController;

  const mockCategorias: CategoriaDTO[] = [
    { id: 1, nombre: 'Alimentación', tipo: 'GASTO', colorHex: '#4caf50', esPredeterminada: true, usuarioId: 1 },
    { id: 2, nombre: 'Transporte', tipo: 'GASTO', colorHex: '#ff9800', esPredeterminada: true, usuarioId: 1 },
  ];

  const mockPresupuestos: PresupuestoDTO[] = [
    { id: 1, mes: 6, anio: 2026, montoLimite: 1000, usuarioId: 1, categoriaId: 1 },
    { id: 2, mes: 6, anio: 2026, montoLimite: 500, usuarioId: 1, categoriaId: 2 },
  ];

  beforeEach(async () => {
    localStorage.setItem('userId', '1');

    await TestBed.configureTestingModule({
      imports: [PresupuestoListComponent, NoopAnimationsModule],
      providers: [
        PresupuestoService,
        CategoriaService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PresupuestoListComponent);
    component = fixture.componentInstance;
    presupuestoService = TestBed.inject(PresupuestoService);
    categoriaService = TestBed.inject(CategoriaService);
    httpMock = TestBed.inject(HttpTestingController);

    categoriaService.categorias.set(mockCategorias);
    presupuestoService.presupuestos.set(mockPresupuestos);
    presupuestoService.loading.set(false);
    presupuestoService.error.set(null);

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

    it('should display title "Presupuestos"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Presupuestos');
    });

    it('should render cards for each budget', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cards = compiled.querySelectorAll('mat-card');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('should display category names', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Alimentación');
      expect(compiled.textContent).toContain('Transporte');
    });

    it('should render progress bars', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const bars = compiled.querySelectorAll('mat-progress-bar');
      expect(bars.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('loading state', () => {
    it('should show loading spinner', () => {
      presupuestoService.loading.set(true);
      presupuestoService.presupuestos.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('should show empty message', () => {
      presupuestoService.presupuestos.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sin presupuestos');
    });
  });
});
