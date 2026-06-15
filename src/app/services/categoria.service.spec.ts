import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CategoriaService } from './categoria.service';
import { CategoriaDTO } from '../models/gasto.models';

describe('CategoriaService', () => {
  let service: CategoriaService;
  let httpMock: HttpTestingController;

  const mockCategorias: CategoriaDTO[] = [
    { id: 1, nombre: 'Alimentación', tipo: 'GASTO', colorHex: '#4caf50', esPredeterminada: true, usuarioId: 1 },
    { id: 2, nombre: 'Transporte', tipo: 'GASTO', colorHex: '#ff9800', esPredeterminada: true, usuarioId: 1 },
    { id: 3, nombre: 'Salario', tipo: 'INGRESO', colorHex: '#2196f3', esPredeterminada: false, usuarioId: 1 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoriaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(CategoriaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // TDD RED: tests written before implementation exists

  describe('getCategorias', () => {
    it('should call GET /API/listar_categorias with usuarioId and populate signal', () => {
      service.getCategorias(1);

      const req = httpMock.expectOne(r =>
        r.url === '/API/listar_categorias' &&
        r.params.get('usuarioId') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCategorias);

      expect(service.categorias().length).toBe(3);
      expect(service.categorias()[0].nombre).toBe('Alimentación');
      expect(service.categorias()[1].colorHex).toBe('#ff9800');
    });

    it('should set loading to true before request and false after completion', () => {
      expect(service.loading()).toBeFalse();

      service.getCategorias(1);

      expect(service.loading()).toBeTrue();

      const req = httpMock.expectOne('/API/listar_categorias?usuarioId=1');
      req.flush(mockCategorias);

      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
    });

    it('should set error signal on HTTP failure', () => {
      service.getCategorias(1);

      const req = httpMock.expectOne('/API/listar_categorias?usuarioId=1');
      req.flush({ message: 'Error del servidor' }, { status: 500, statusText: 'Internal Server Error' });

      expect(service.error()).toBe('Error al cargar categorías');
      expect(service.loading()).toBeFalse();
      expect(service.categorias().length).toBe(0);
    });
  });

  describe('createCategoria', () => {
    const newCategoria = { nombre: 'Entretenimiento', tipo: 'GASTO', colorHex: '#9c27b0', usuarioId: 1 };

    it('should call POST /API/crear_categoria and add to signal list', () => {
      const created: CategoriaDTO = { id: 4, ...newCategoria, esPredeterminada: false };

      service.createCategoria(newCategoria).subscribe(response => {
        expect(response.id).toBe(4);
        expect(response.nombre).toBe('Entretenimiento');
      });

      const req = httpMock.expectOne('/API/crear_categoria');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCategoria);
      req.flush(created);

      // After creation, the list should include the new item
      expect(service.categorias().length).toBe(1);
      expect(service.categorias()[0].nombre).toBe('Entretenimiento');
    });

    it('should propagate HTTP errors on creation failure', () => {
      service.createCategoria(newCategoria).subscribe({
        error: (err) => {
          expect(err.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/API/crear_categoria');
      req.flush({ message: 'Datos inválidos' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
