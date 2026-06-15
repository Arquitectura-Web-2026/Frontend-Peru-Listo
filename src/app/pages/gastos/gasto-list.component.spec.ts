import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GastoListComponent } from './gasto-list.component';
import { GastoService } from '../../services/gasto.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { GastoDTO } from '../../models/gasto.models';
import { provideRouter } from '@angular/router';

describe('GastoListComponent', () => {
  let component: GastoListComponent;
  let fixture: ComponentFixture<GastoListComponent>;
  let gastoService: GastoService;
  let httpMock: HttpTestingController;

  const mockGastos: GastoDTO[] = [
    { id: 1, descripcion: 'Supermercado', monto: 150.50, fechagasto: '2026-06-01', usuarioId: 1, categoriaId: 1, categoriaNombre: 'Alimentación' },
    { id: 2, descripcion: 'Gasolina', monto: 45.00, fechagasto: '2026-06-03', usuarioId: 1, categoriaId: 2, categoriaNombre: 'Transporte' },
    { id: 3, descripcion: 'Cena', monto: 80.00, fechagasto: '2026-05-28', usuarioId: 1, categoriaId: 1, categoriaNombre: 'Alimentación' },
  ];

  beforeEach(async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');
    localStorage.setItem('correo', 'test@test.com');

    await TestBed.configureTestingModule({
      imports: [GastoListComponent, NoopAnimationsModule],
      providers: [
        GastoService,
        CategoriaService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GastoListComponent);
    component = fixture.componentInstance;
    gastoService = TestBed.inject(GastoService);
    httpMock = TestBed.inject(HttpTestingController);

    // Pre-populate service signals
    gastoService.gastos.set(mockGastos);
    gastoService.loading.set(false);
    gastoService.error.set(null);

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

    it('should display the title "Gastos"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Gastos');
    });

    it('should render table rows for each expense', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const rows = compiled.querySelectorAll('tr[mat-row]');
      expect(rows.length).toBe(3);
    });

    it('should display expense descriptions in table', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Supermercado');
      expect(compiled.textContent).toContain('Gasolina');
      expect(compiled.textContent).toContain('Cena');
    });

    it('should display amounts formatted', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('150.50');
      expect(compiled.textContent).toContain('45.00');
    });

    it('should display a FAB for adding new expense', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const fab = compiled.querySelector('button[mat-fab]');
      expect(fab).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when loading signal is true', () => {
      gastoService.loading.set(true);
      gastoService.gastos.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('should show "Sin gastos" message when gastos is empty', () => {
      gastoService.gastos.set([]);
      gastoService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sin gastos');
    });
  });

  describe('error state', () => {
    it('should show error message with retry button', () => {
      gastoService.error.set('Error de conexión');
      gastoService.loading.set(false);
      gastoService.gastos.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Error de conexión');
      expect(compiled.querySelector('button')).toBeTruthy();
    });
  });

  describe('delete', () => {
    it('should call deleteGasto and refresh list on confirmed delete', () => {
      const deleteSpy = spyOn(gastoService, 'deleteGasto').and.callThrough();

      component.deleteGasto(1);

      const req = httpMock.expectOne('/API/eliminar_gasto/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });
});
