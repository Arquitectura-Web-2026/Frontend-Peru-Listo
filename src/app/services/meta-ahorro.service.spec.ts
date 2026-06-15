import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MetaAhorroService } from './meta-ahorro.service';
import { MetaAhorroDTO } from '../models/meta.models';

describe('MetaAhorroService', () => {
  let service: MetaAhorroService;
  let httpMock: HttpTestingController;

  const mockMetas: MetaAhorroDTO[] = [
    { id: 1, nombre: 'Auto', montoObjetivo: 30000, montoActual: 15000, fechaLimite: '2026-12-31', estado: 'ACTIVA', usuarioId: 1 },
    { id: 2, nombre: 'Viaje', montoObjetivo: 5000, montoActual: 2000, fechaLimite: '2026-08-15', estado: 'ACTIVA', usuarioId: 1 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MetaAhorroService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(MetaAhorroService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getMetas', () => {
    it('should call GET /API/listar_metas with usuarioId and populate signal', () => {
      service.getMetas(1);

      const req = httpMock.expectOne(r =>
        r.url === '/API/listar_metas' &&
        r.params.get('usuarioId') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockMetas);

      expect(service.metas().length).toBe(2);
      expect(service.metas()[0].nombre).toBe('Auto');
    });

    it('should set loading/error signals', () => {
      service.getMetas(1);
      expect(service.loading()).toBeTrue();

      const req = httpMock.expectOne('/API/listar_metas?usuarioId=1');
      req.flush(mockMetas);

      expect(service.loading()).toBeFalse();
    });

    it('should set error on failure', () => {
      service.getMetas(1);

      const req = httpMock.expectOne('/API/listar_metas?usuarioId=1');
      req.flush({}, { status: 500, statusText: 'Error' });

      expect(service.error()).toBe('Error al cargar metas de ahorro');
    });
  });

  describe('createMeta', () => {
    const dto = { nombre: 'Laptop', montoObjetivo: 8000, montoActual: 0, fechaLimite: '2026-12-01', estado: 'ACTIVA', usuarioId: 1 };

    it('should call POST /API/crear_meta and add to signal', () => {
      const created: MetaAhorroDTO = { id: 3, ...dto };

      service.createMeta(dto).subscribe(response => {
        expect(response.id).toBe(3);
      });

      const req = httpMock.expectOne('/API/crear_meta');
      expect(req.request.method).toBe('POST');
      req.flush(created);

      expect(service.metas().length).toBe(1);
      expect(service.metas()[0].nombre).toBe('Laptop');
    });
  });

  describe('aportarMeta', () => {
    it('should call PUT /API/aportar_meta/{id} with amount', () => {
      service.getMetas(1);
      const listReq = httpMock.expectOne('/API/listar_metas?usuarioId=1');
      listReq.flush([...mockMetas]);

      service.aportarMeta(1, 5000).subscribe();

      const req = httpMock.expectOne('/API/aportar_meta/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ monto: 5000 });

      const updated = { ...mockMetas[0], montoActual: 20000 };
      req.flush(updated);

      expect(service.metas()[0].montoActual).toBe(20000);
    });
  });
});
