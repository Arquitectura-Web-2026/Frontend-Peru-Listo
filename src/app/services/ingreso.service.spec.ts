import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { IngresoService } from './ingreso.service';
import { IngresoDTO } from '../models/ingreso.models';

describe('IngresoService', () => {
  let service: IngresoService;
  let httpMock: HttpTestingController;

  const mockIngresos: IngresoDTO[] = [
    { id: 1, descripcion: 'Salario', monto: 5000, fecha: '2026-06-01', usuarioId: 1 },
    { id: 2, descripcion: 'Freelance', monto: 1500, fecha: '2026-06-10', usuarioId: 1 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IngresoService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(IngresoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getIngresos', () => {
    it('should call GET /API/listar_ingresos with usuarioId and populate ingresos signal', () => {
      service.getIngresos(1);

      const req = httpMock.expectOne(r =>
        r.url === '/API/listar_ingresos' &&
        r.params.get('usuarioId') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockIngresos);

      expect(service.ingresos().length).toBe(2);
      expect(service.ingresos()[0].descripcion).toBe('Salario');
    });

    it('should include mes and anio query params when provided', () => {
      service.getIngresos(1, 6, 2026);

      const req = httpMock.expectOne(r =>
        r.url === '/API/listar_ingresos' &&
        r.params.get('usuarioId') === '1' &&
        r.params.get('mes') === '6' &&
        r.params.get('anio') === '2026'
      );
      req.flush([mockIngresos[0]]);

      expect(service.ingresos().length).toBe(1);
    });

    it('should set loading/error signals appropriately', () => {
      service.getIngresos(1);
      expect(service.loading()).toBeTrue();

      const req = httpMock.expectOne('/API/listar_ingresos?usuarioId=1');
      req.flush(mockIngresos);

      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
    });

    it('should set error on failure', () => {
      service.getIngresos(1);

      const req = httpMock.expectOne('/API/listar_ingresos?usuarioId=1');
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });

      expect(service.error()).toBe('Error al cargar ingresos');
      expect(service.loading()).toBeFalse();
    });
  });

  describe('createIngreso', () => {
    const newIngreso = { descripcion: 'Bono', monto: 1000, fecha: '2026-06-15', usuarioId: 1 };

    it('should call POST /API/registrar_ingreso and add to signal', () => {
      const created: IngresoDTO = { id: 3, ...newIngreso };

      service.createIngreso(newIngreso).subscribe(response => {
        expect(response.id).toBe(3);
        expect(response.monto).toBe(1000);
      });

      const req = httpMock.expectOne('/API/registrar_ingreso');
      expect(req.request.method).toBe('POST');
      req.flush(created);

      expect(service.ingresos().length).toBe(1);
    });
  });

  describe('updateIngreso', () => {
    it('should call PUT /API/editar_ingreso/{id} and update in signal', () => {
      service.getIngresos(1);
      const listReq = httpMock.expectOne('/API/listar_ingresos?usuarioId=1');
      listReq.flush([...mockIngresos]);

      const updated = { descripcion: 'Salario actualizado', monto: 5500, fecha: '2026-06-01', usuarioId: 1 };

      service.updateIngreso(1, updated).subscribe(response => {
        expect(response.descripcion).toBe('Salario actualizado');
      });

      const req = httpMock.expectOne('/API/editar_ingreso/1');
      expect(req.request.method).toBe('PUT');
      req.flush({ id: 1, ...updated });

      expect(service.ingresos()[0].descripcion).toBe('Salario actualizado');
    });
  });

  describe('deleteIngreso', () => {
    it('should call DELETE /API/eliminar_ingreso/{id} and remove from signal', () => {
      service.getIngresos(1);
      const listReq = httpMock.expectOne('/API/listar_ingresos?usuarioId=1');
      listReq.flush([...mockIngresos]);
      expect(service.ingresos().length).toBe(2);

      service.deleteIngreso(1).subscribe();

      const req = httpMock.expectOne('/API/eliminar_ingreso/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(service.ingresos().length).toBe(1);
    });
  });
});
