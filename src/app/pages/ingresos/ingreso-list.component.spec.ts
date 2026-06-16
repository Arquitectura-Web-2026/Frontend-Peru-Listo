import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngresoListComponent } from './ingreso-list.component';
import { IngresoService } from '../../services/ingreso.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { IngresoDTO } from '../../models/ingreso.models';

describe('IngresoListComponent', () => {
  let component: IngresoListComponent;
  let fixture: ComponentFixture<IngresoListComponent>;
  let ingresoService: IngresoService;
  let httpMock: HttpTestingController;

  const mockIngresos: IngresoDTO[] = [
    { id: 1, descripcion: 'Salario', monto: 5000, fecha: '2026-06-01', usuarioId: 1 },
    { id: 2, descripcion: 'Freelance', monto: 1500, fecha: '2026-06-10', usuarioId: 1 },
  ];

  beforeEach(async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');
    localStorage.setItem('correo', 'test@test.com');

    await TestBed.configureTestingModule({
      imports: [IngresoListComponent, NoopAnimationsModule],
      providers: [
        IngresoService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoListComponent);
    component = fixture.componentInstance;
    ingresoService = TestBed.inject(IngresoService);
    httpMock = TestBed.inject(HttpTestingController);

    ingresoService.ingresos.set(mockIngresos);
    ingresoService.loading.set(false);
    ingresoService.error.set(null);

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

    it('should display the title "Ingresos"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Ingresos');
    });

    it('should render table rows for each income', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cells = compiled.querySelectorAll('td.mat-column-descripcion');
      expect(cells.length).toBe(2);
    });

    it('should display income descriptions', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Salario');
      expect(compiled.textContent).toContain('Freelance');
    });

    it('should display a FAB for adding new income', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const fab = compiled.querySelector('button[mat-fab]');
      expect(fab).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when loading', () => {
      ingresoService.loading.set(true);
      ingresoService.ingresos.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no incomes', () => {
      ingresoService.ingresos.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sin ingresos');
    });
  });

  describe('error state', () => {
    it('should show error message with retry', () => {
      ingresoService.error.set('Error de conexión');
      ingresoService.ingresos.set([]); // Limpiado: Quitamos la 'g' intrusa y la coalescencia rota
      ingresoService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Error de conexión');
    });
  });

  describe('delete', () => {
    it('should call deleteIngreso on confirmed delete', () => {
      const deleteSpy = spyOn(ingresoService, 'deleteIngreso').and.callThrough();
      spyOn(window, 'confirm').and.returnValue(true);

      component.confirmDelete(1);

      const req = httpMock.expectOne('/API/eliminar_ingreso/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });
});
