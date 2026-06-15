import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PresupuestoService } from './presupuesto.service';
import { PresupuestoDTO } from '../models/presupuesto.models';

describe('PresupuestoService', () => {
  let service: PresupuestoService;
  let httpMock: HttpTestingController;

  const mockPresupuestos: PresupuestoDTO[] = [
    { id: 1, mes: 6, anio: 2026, montoLimite: 1000, usuarioId: 1, categoriaId: 1 },
    { id: 2, mes: 6, anio: 2026, montoLimite: 500, usuarioId: 1, categoriaId: 2 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PresupuestoService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(PresupuestoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPresupuestos', () => {
    it('should call GET /API/listar_presupuestos with params and populate signal', () => {
      service.getPresupuestos(1, 6, 2026);

      const req = httpMock.expectOne(r =>
        r.url === '/API/listar_presupuestos' &&
        r.params.get('usuarioId') === '1' &&
        r.params.get('mes') === '6' &&
        r.params.get('anio') === '2026'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPresupuestos);

      expect(service.presupuestos().length).toBe(2);
      expect(service.presupuestos()[0].montoLimite).toBe(1000);
    });

    it('should set loading/error signals appropriately', () => {
      service.getPresupuestos(1, 6, 2026);
      expect(service.loading()).toBeTrue();

      const req = httpMock.expectOne('/API/listar_presupuestos?usuarioId=1&mes=6&anio=2026');
      req.flush(mockPresupuestos);

      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
    });

    it('should set error on failure', () => {
      service.getPresupuestos(1);

      const req = httpMock.expectOne('/API/listar_presupuestos?usuarioId=1');
      req.flush({}, { status: 500, statusText: 'Error' });

      expect(service.error()).toBe('Error al cargar presupuestos');
      expect(service.loading()).toBeFalse();
    });
  });

  describe('createPresupuesto', () => {
    const dto = { mes: 6, anio: 2026, montoLimite: 300, usuarioId: 1, categoriaId: 3 };

    it('should call POST /API/crear_presupuesto and add to signal', () => {
      const created: PresupuestoDTO = { id: 3, ...dto };

      service.createPresupuesto(dto).subscribe(response => {
        expect(response.id).toBe(3);
      });

      const req = httpMock.expectOne('/API/crear_presupuesto');
      expect(req.request.method).toBe('POST');
      req.flush(created);

      expect(service.presupuestos().length).toBe(1);
    });
  });

  describe('updatePresupuesto', () => {
    it('should call PUT /API/editar_presupuesto/{id} and update signal', () => {
      service.getPresupuestos(1, 6, 2026);
      const listReq = httpMock.expectOne('/API/listar_presupuestos?usuarioId=1&mes=6&anio=2026');
      listReq.flush([...mockPresupuestos]);

      service.updatePresupuesto(1, { montoLimite: 1200 }).subscribe();

      const req = httpMock.expectOne('/API/editar_presupuesto/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ montoLimite: 1200 });
      req.flush({ id: 1, mes: 6, anio: 2026, montoLimite: 1200, usuarioId: 1, categoriaId: 1 });

      expect(service.presupuestos()[0].montoLimite).toBe(1200);
    });
  });

  describe('deletePresupuesto', () => {
    it('should call DELETE /API/eliminar_presupuesto/{id} and remove from signal', () => {
      service.getPresupuestos(1, 6, 2026);
      const listReq = httpMock.expectOne('/API/listar_presupuestos?usuarioId=1&mes=6&anio=2026');
      listReq.flush([...mockPresupuestos]);
      expect(service.presupuestos().length).toBe(2);

      service.deletePresupuesto(1).subscribe();

      const req = httpMock.expectOne('/API/eliminar_presupuesto/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(service.presupuestos().length).toBe(1);
    });
  });
});
