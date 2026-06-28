import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriaListComponent } from './categoria-list.component';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { CategoriaDTO } from '../../models/gasto.models';
import { of } from 'rxjs';

describe('CategoriaListComponent', () => {
  let component: CategoriaListComponent;
  let fixture: ComponentFixture<CategoriaListComponent>;
  let categoriaService: CategoriaService;
  let httpMock: HttpTestingController;

  const mockCategorias: CategoriaDTO[] = [
    { id: 1, nombre: 'Alimentación', tipo: 'gasto', colorHex: '#FF6B6B', esPredeterminada: true, usuarioId: 1 },
    { id: 2, nombre: 'Transporte', tipo: 'gasto', colorHex: '#4ECDC4', esPredeterminada: true, usuarioId: 1 },
    { id: 3, nombre: 'Suscripciones', tipo: 'gasto', colorHex: '#9c27b0', esPredeterminada: false, usuarioId: 1 },
  ];

  beforeEach(async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');
    localStorage.setItem('correo', 'test@test.com');

    await TestBed.configureTestingModule({
      imports: [CategoriaListComponent, NoopAnimationsModule],
      providers: [
        CategoriaService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaListComponent);
    component = fixture.componentInstance;
    categoriaService = TestBed.inject(CategoriaService);
    httpMock = TestBed.inject(HttpTestingController);

    // Pre-populate signals
    categoriaService.categorias.set(mockCategorias);
    categoriaService.loading.set(false);
    categoriaService.error.set(null);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function flushInitRequests() {
    fixture.detectChanges();
    const reqs = httpMock.match(r => r.url.includes('/API/listar_categorias'));
    reqs.forEach(req => req.flush(mockCategorias));
    fixture.detectChanges();
  }

  describe('rendering', () => {
    it('should create the component', () => {
      flushInitRequests();
      expect(component).toBeTruthy();
    });

    it('should display title "Categorías"', () => {
      flushInitRequests();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Categorías');
    });

    it('should render category names in the table', () => {
      flushInitRequests();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Alimentación');
      expect(compiled.textContent).toContain('Transporte');
      expect(compiled.textContent).toContain('Suscripciones');
    });

    it('should show color swatch for each category', () => {
      flushInitRequests();
      const compiled = fixture.nativeElement as HTMLElement;
      const colorSwatches = compiled.querySelectorAll('[style*="background-color"]');
      expect(colorSwatches.length).toBeGreaterThanOrEqual(3);
    });

    it('should hide delete button for predetermined categories', () => {
      flushInitRequests();
      const compiled = fixture.nativeElement as HTMLElement;
      const deleteButtons = compiled.querySelectorAll('[data-testid="delete-btn"]');
      // Only 1 non-predetermined category (Suscripciones id=3)
      expect(deleteButtons.length).toBe(1);
    });

    it('should display a FAB for adding new category', () => {
      flushInitRequests();
      const compiled = fixture.nativeElement as HTMLElement;
      const fab = compiled.querySelector('button[mat-fab]');
      expect(fab).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when loading signal is true', () => {
      fixture.detectChanges();
      categoriaService.loading.set(true);
      categoriaService.categorias.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner, mat-progress-spinner')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no categories', () => {
      fixture.detectChanges();
      categoriaService.categorias.set([]);
      categoriaService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sin categorías');
    });
  });

  describe('error state', () => {
    it('should show error message', () => {
      fixture.detectChanges();
      categoriaService.error.set('Error de conexión');
      categoriaService.loading.set(false);
      categoriaService.categorias.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Error de conexión');
    });
  });

  describe('delete', () => {
    it('should call deleteCategoria on confirmed delete', () => {
      flushInitRequests();

      const deleteSpy = spyOn(categoriaService, 'deleteCategoria').and.returnValue(of({ message: 'Eliminada' }));
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteCategory(3);

      expect(deleteSpy).toHaveBeenCalledWith(3, 1);
    });
  });
});
