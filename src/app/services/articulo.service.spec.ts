import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ArticuloService } from './articulo.service';
import { ArticuloEducacionDTO } from '../models/articulo.models';

describe('ArticuloService', () => {
  let service: ArticuloService;
  let httpMock: HttpTestingController;

  const mockArticulos: ArticuloEducacionDTO[] = [
    {
      id: 1,
      titulo: 'Cómo ahorrar para el futuro',
      descripcionCorta: 'Guía práctica de ahorro',
      cuerpo: '<p>Contenido completo sobre ahorro...</p>',
      categoriaTematica: 'Ahorro',
      fechaPublicacion: '2026-06-01'
    },
    {
      id: 2,
      titulo: 'Inversión para principiantes',
      descripcionCorta: 'Aprende a invertir desde cero',
      cuerpo: '<p>Contenido sobre inversión...</p>',
      categoriaTematica: 'Inversión',
      fechaPublicacion: '2026-06-15'
    },
    {
      id: 3,
      titulo: 'Manejo de deudas',
      descripcionCorta: 'Cómo salir de las deudas',
      cuerpo: '<p>Contenido sobre deudas...</p>',
      categoriaTematica: 'Deudas',
      fechaPublicacion: '2026-05-20'
    },
  ];

  const mockArticulo: ArticuloEducacionDTO = mockArticulos[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArticuloService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(ArticuloService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // TDD: RED tests

  describe('getArticulos', () => {
    it('should call GET /API/listar_articulos with default pagination', () => {
      service.getArticulos().subscribe(response => {
        expect(response.length).toBe(3);
        expect(response[0].titulo).toBe('Cómo ahorrar para el futuro');
      });

      const req = httpMock.expectOne(r =>
        r.url === '/API/listar_articulos' &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockArticulos);

      expect(service.articulos().length).toBe(3);
    });

    it('should call GET /API/listar_articulos with custom pagination', () => {
      service.getArticulos(1, 5).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === '/API/listar_articulos' &&
        r.params.get('page') === '1' &&
        r.params.get('size') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should set loading to true while fetching and false after', () => {
      expect(service.loading()).toBeFalse();

      service.getArticulos().subscribe();
      expect(service.loading()).toBeTrue();

      const req = httpMock.expectOne('/API/listar_articulos?page=0&size=10');
      req.flush(mockArticulos);

      expect(service.loading()).toBeFalse();
    });

    it('should set error on failure', () => {
      service.getArticulos().subscribe({
        error: () => {}
      });

      const req = httpMock.expectOne('/API/listar_articulos?page=0&size=10');
      req.flush({ message: 'Error del servidor' }, { status: 500, statusText: 'Server Error' });

      expect(service.error()).toContain('Error');
      expect(service.loading()).toBeFalse();
    });
  });

  describe('getArticulo', () => {
    it('should call GET /API/ver_articulo/{id} and return single article', () => {
      service.getArticulo(1).subscribe(response => {
        expect(response.id).toBe(1);
        expect(response.titulo).toBe('Cómo ahorrar para el futuro');
        expect(response.categoriaTematica).toBe('Ahorro');
      });

      const req = httpMock.expectOne('/API/ver_articulo/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockArticulo);
    });

    it('should handle 404 for non-existent article', () => {
      let errorMessage = '';
      service.getArticulo(999).subscribe({
        error: (err) => { errorMessage = err.error?.message || err.message; }
      });

      const req = httpMock.expectOne('/API/ver_articulo/999');
      req.flush({ message: 'Artículo no encontrado' }, { status: 404, statusText: 'Not Found' });

      expect(errorMessage).toBe('Artículo no encontrado');
    });
  });

  describe('filtrarPorCategoria', () => {
    it('should call GET /API/filtrar_articulos with categoria param', () => {
      service.filtrarPorCategoria('Ahorro').subscribe(response => {
        expect(response.length).toBe(1);
        expect(response[0].categoriaTematica).toBe('Ahorro');
      });

      const req = httpMock.expectOne(r =>
        r.url === '/API/filtrar_articulos' &&
        r.params.get('categoria') === 'Ahorro'
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockArticulo]);

      expect(service.articulos().length).toBe(1);
    });
  });

  describe('sugerirArticulos', () => {
    it('should call GET /API/sugerir_articulos with usuarioId param', () => {
      service.sugerirArticulos(1).subscribe(response => {
        expect(response.length).toBe(3);
      });

      const req = httpMock.expectOne(r =>
        r.url === '/API/sugerir_articulos' &&
        r.params.get('usuarioId') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockArticulos);

      expect(service.articulos().length).toBe(3);
    });
  });
});
