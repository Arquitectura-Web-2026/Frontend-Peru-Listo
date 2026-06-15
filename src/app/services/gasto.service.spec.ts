import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GastoService } from './gasto.service';
import { GastoDTO } from '../models/gasto.models';

describe('GastoService', () => {
  let service: GastoService;
  let httpMock: HttpTestingController;

  const mockGastos: GastoDTO[] = [
    { id: 1, descripcion: 'Supermercado', monto: 150.50, fechagasto: '2026-06-01', usuarioId: 1, categoriaId: 1, categoriaNombre: 'Alimentación' },
    { id: 2, descripcion: 'Gasolina', monto: 45.00, fechagasto: '2026-06-03', usuarioId: 1, categoriaId: 2, categoriaNombre: 'Transporte' },
    { id: 3, descripcion: 'Cena restaurante', monto: 80.00, fechagasto: '2026-05-28', usuarioId: 1, categoriaId: 1, categoriaNombre: 'Alimentación' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GastoService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(GastoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // TDD RED: tests written before implementation

  describe('getGastos', () => {
    it('should call GET /API/listar_gastos with usuarioId and populate gastos signal', () => {
      service.getGastos(1);

      const req = httpMock.expectOne(r =>
        r.url === '/API/listar_gastos' &&
        r.params.get('usuarioId') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockGastos);

      expect(service.gastos().length).toBe(3);
      expect(service.gastos()[0].descripcion).toBe('Supermercado');
    });

    it('should include mes and anio query params when provided', () => {
      service.getGastos(1, 6, 2026);

      const req = httpMock.expectOne(r =>
        r.url === '/API/listar_gastos' &&
        r.params.get('usuarioId') === '1' &&
        r.params.get('mes') === '6' &&
        r.params.get('anio') === '2026'
      );
      req.flush([mockGastos[0], mockGastos[1]]);

      expect(service.gastos().length).toBe(2);
    });

    it('should set loading/error signals appropriately', () => {
      service.getGastos(1);

      expect(service.loading()).toBeTrue();

      const req = httpMock.expectOne('/API/listar_gastos?usuarioId=1');
      req.flush(mockGastos);

      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
    });

    it('should handle empty result', () => {
      service.getGastos(99);

      const req = httpMock.expectOne('/API/listar_gastos?usuarioId=99');
      req.flush([]);

      expect(service.gastos().length).toBe(0);
      expect(service.loading()).toBeFalse();
    });

    it('should set error on failure', () => {
      service.getGastos(1);

      const req = httpMock.expectOne('/API/listar_gastos?usuarioId=1');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });

      expect(service.error()).toBe('Error al cargar gastos');
      expect(service.loading()).toBeFalse();
    });
  });

  describe('createGasto', () => {
    const newGasto = { descripcion: 'Nuevo gasto', monto: 99.99, fechagasto: '2026-06-10', usuarioId: 1, categoriaId: 1 };

    it('should call POST /API/registrar_gasto and add to signal', () => {
      const created: GastoDTO = { id: 4, ...newGasto, categoriaNombre: 'Alimentación' };

      service.createGasto(newGasto).subscribe(response => {
        expect(response.id).toBe(4);
        expect(response.descripcion).toBe('Nuevo gasto');
      });

      const req = httpMock.expectOne('/API/registrar_gasto');
      expect(req.request.method).toBe('POST');
      req.flush(created);

      expect(service.gastos().length).toBe(1);
      expect(service.gastos()[0].monto).toBe(99.99);
    });
  });

  describe('updateGasto', () => {
    it('should call PUT /API/editar_gasto/{id} and update the item in signal list', () => {
      // Pre-populate the signal with existing items
      service.getGastos(1);
      const listReq = httpMock.expectOne('/API/listar_gastos?usuarioId=1');
      listReq.flush([...mockGastos]);

      const updated = { descripcion: 'Supermercado actualizado', monto: 175.00, fechagasto: '2026-06-01', usuarioId: 1, categoriaId: 1 };

      service.updateGasto(1, updated).subscribe(response => {
        expect(response.descripcion).toBe('Supermercado actualizado');
        expect(response.monto).toBe(175.00);
      });

      const req = httpMock.expectOne('/API/editar_gasto/1');
      expect(req.request.method).toBe('PUT');
      req.flush({ id: 1, ...updated, categoriaNombre: 'Alimentación' });

      expect(service.gastos()[0].descripcion).toBe('Supermercado actualizado');
      expect(service.gastos()[0].monto).toBe(175.00);
    });
  });

  describe('deleteGasto', () => {
    it('should call DELETE /API/eliminar_gasto/{id} and remove from signal', () => {
      // Pre-populate
      service.getGastos(1);
      const listReq = httpMock.expectOne('/API/listar_gastos?usuarioId=1');
      listReq.flush([...mockGastos]);
      expect(service.gastos().length).toBe(3);

      service.deleteGasto(1).subscribe();

      const req = httpMock.expectOne('/API/eliminar_gasto/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(service.gastos().length).toBe(2);
      expect(service.gastos().find(g => g.id === 1)).toBeUndefined();
    });
  });

  describe('searchGastos', () => {
    it('should call GET /API/buscar_gastos with usuarioId and query param q', () => {
      service.searchGastos(1, 'supermercado');

      const req = httpMock.expectOne(r =>
        r.url === '/API/buscar_gastos' &&
        r.params.get('usuarioId') === '1' &&
        r.params.get('q') === 'supermercado'
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockGastos[0]]);

      expect(service.gastos().length).toBe(1);
      expect(service.gastos()[0].descripcion).toBe('Supermercado');
    });

    it('should handle empty search results', () => {
      service.searchGastos(1, 'inexistente');

      const req = httpMock.expectOne('/API/buscar_gastos?usuarioId=1&q=inexistente');
      req.flush([]);

      expect(service.gastos().length).toBe(0);
    });
  });
});
