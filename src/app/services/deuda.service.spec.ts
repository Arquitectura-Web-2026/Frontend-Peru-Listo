import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DeudaService } from './deuda.service';
import { DeudaDTO } from '../models/deuda.models';

describe('DeudaService', () => {
  let service: DeudaService;
  let httpMock: HttpTestingController;

  const mockDeudas: DeudaDTO[] = [
    { id: 1, acreedor: 'Banco XYZ', monto: 5000, fechaLimite: '2026-07-15', estado: 'PENDIENTE', usuarioId: 1 },
    { id: 2, acreedor: 'Tarjeta ABC', monto: 2000, fechaLimite: '2026-06-20', estado: 'PAGADA', usuarioId: 1 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DeudaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(DeudaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getDeudas', () => {
    it('should call GET /API/listar_deudas with usuarioId and populate signal', () => {
      service.getDeudas(1);

      const req = httpMock.expectOne(r =>
        r.url === '/API/listar_deudas' &&
        r.params.get('usuarioId') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDeudas);

      expect(service.deudas().length).toBe(2);
      expect(service.deudas()[0].acreedor).toBe('Banco XYZ');
    });

    it('should set error on failure', () => {
      service.getDeudas(1);

      const req = httpMock.expectOne('/API/listar_deudas?usuarioId=1');
      req.flush({}, { status: 500, statusText: 'Error' });

      expect(service.error()).toBe('Error al cargar deudas');
    });
  });

  describe('createDeuda', () => {
    const dto = { acreedor: 'Préstamo', monto: 3000, fechaLimite: '2026-09-01', estado: 'PENDIENTE', usuarioId: 1 };

    it('should call POST /API/registrar_deuda and add to signal', () => {
      const created: DeudaDTO = { id: 3, ...dto };

      service.createDeuda(dto).subscribe(response => {
        expect(response.id).toBe(3);
      });

      const req = httpMock.expectOne('/API/registrar_deuda');
      expect(req.request.method).toBe('POST');
      req.flush(created);

      expect(service.deudas().length).toBe(1);
    });
  });

  describe('marcarPagada', () => {
    it('should call PUT /API/marcar_pagada/{id} and update signal', () => {
      service.getDeudas(1);
      const listReq = httpMock.expectOne('/API/listar_deudas?usuarioId=1');
      listReq.flush([...mockDeudas]);

      service.marcarPagada(1).subscribe();

      const req = httpMock.expectOne('/API/marcar_pagada/1');
      expect(req.request.method).toBe('PUT');

      const updated = { ...mockDeudas[0], estado: 'PAGADA' };
      req.flush(updated);

      expect(service.deudas()[0].estado).toBe('PAGADA');
    });
  });

  describe('deleteDeuda', () => {
    it('should call DELETE /API/eliminar_deuda/{id} and remove from signal', () => {
      service.getDeudas(1);
      const listReq = httpMock.expectOne('/API/listar_deudas?usuarioId=1');
      listReq.flush([...mockDeudas]);

      service.deleteDeuda(1).subscribe();

      const req = httpMock.expectOne('/API/eliminar_deuda/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(service.deudas().length).toBe(1);
    });
  });
});
