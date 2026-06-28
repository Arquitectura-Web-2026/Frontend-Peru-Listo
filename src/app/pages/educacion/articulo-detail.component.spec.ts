import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ArticuloDetailComponent } from './articulo-detail.component';
import { ArticuloService } from '../../services/articulo.service';
import { ArticuloEducacionDTO } from '../../models/articulo.models';

describe('ArticuloDetailComponent', () => {
  let component: ArticuloDetailComponent;
  let fixture: ComponentFixture<ArticuloDetailComponent>;
  let httpMock: HttpTestingController;

  const mockArticulo: ArticuloEducacionDTO = {
    id: 1,
    titulo: 'Cómo ahorrar para el futuro',
    descripcionCorta: 'Guía práctica de ahorro',
    cuerpo: '<p>Contenido completo sobre ahorro personal...</p>',
    categoriaTematica: 'Ahorro',
    fechaPublicacion: '2026-06-01'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticuloDetailComponent, NoopAnimationsModule],
      providers: [
        ArticuloService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => key === 'id' ? '1' : null }),
            snapshot: { paramMap: { get: (key: string) => key === 'id' ? '1' : null } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticuloDetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // TDD: RED tests

  describe('rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should fetch article by route param on init', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('/API/ver_articulo/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockArticulo);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Cómo ahorrar para el futuro');
    });

    it('should display article body content', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('/API/ver_articulo/1');
      req.flush(mockArticulo);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Contenido completo sobre ahorro personal...');
    });

    it('should display category chip', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('/API/ver_articulo/1');
      req.flush(mockArticulo);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Ahorro');
    });

    it('should have a back button to /educacion', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('/API/ver_articulo/1');
      req.flush(mockArticulo);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const backBtn = compiled.querySelector('a[routerlink="/educacion"], button[routerlink="/educacion"]');
      expect(backBtn).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show loading spinner while fetching', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();

      const req = httpMock.expectOne('/API/ver_articulo/1');
      req.flush(mockArticulo);
    });
  });

  describe('error state', () => {
    it('should show error when article not found', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('/API/ver_articulo/1');
      req.flush({ message: 'Artículo no encontrado' }, { status: 404, statusText: 'Not Found' });

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Artículo no encontrado');
    });
  });
});
