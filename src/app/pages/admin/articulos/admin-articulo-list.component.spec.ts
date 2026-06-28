import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AdminArticuloListComponent } from './admin-articulo-list.component';
import { AdminService } from '../../../services/admin.service';
import { ArticuloService } from '../../../services/articulo.service';
import { ArticuloEducacionDTO } from '../../../models/articulo.models';

describe('AdminArticuloListComponent', () => {
  let component: AdminArticuloListComponent;
  let fixture: ComponentFixture<AdminArticuloListComponent>;
  let httpMock: HttpTestingController;

  const mockArticulos: ArticuloEducacionDTO[] = [
    { id: 1, titulo: 'Ahorro básico', descripcionCorta: 'Guía de ahorro', cuerpo: '<p>...</p>', categoriaTematica: 'Ahorro', fechaPublicacion: '2026-06-01' },
    { id: 2, titulo: 'Inversión avanzada', descripcionCorta: 'Inversión', cuerpo: '<p>...</p>', categoriaTematica: 'Inversión', fechaPublicacion: '2026-06-15' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminArticuloListComponent, NoopAnimationsModule],
      providers: [
        AdminService,
        ArticuloService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminArticuloListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    const articuloService = TestBed.inject(ArticuloService);
    articuloService.articulos.set(mockArticulos);
    articuloService.loading.set(false);

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
      expect(compiled.textContent).toContain('Administrar Artículos');
    });

    it('should render article titles in table', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Ahorro básico');
      expect(compiled.textContent).toContain('Inversión avanzada');
    });

    it('should render category chips', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Ahorro');
      expect(compiled.textContent).toContain('Inversión');
    });

    it('should have a FAB to create new article', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const fab = compiled.querySelector('button[routerlink="/admin/articulos/nuevo"]');
      expect(fab).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show spinner when loading', () => {
      const articuloService = TestBed.inject(ArticuloService);
      articuloService.loading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no articles', () => {
      const articuloService = TestBed.inject(ArticuloService);
      articuloService.articulos.set([]);
      articuloService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sin artículos');
    });
  });
});
