import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DashboardService } from './dashboard.service';
import { DashboardResumenDTO, GastosCategoriaDTO, ComparativaMensualDTO } from '../models/dashboard.models';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  const mockResumen: DashboardResumenDTO = {
    totalIngresos: 5000.50,
    totalGastos: 3200.75,
    balance: 1799.75,
    mes: 6,
    anio: 2026
  };

  const mockCategorias: GastosCategoriaDTO[] = [
    { categoriaNombre: 'Alimentación', monto: 1500, porcentaje: 46.9 },
    { categoriaNombre: 'Transporte', monto: 800, porcentaje: 25.0 },
    { categoriaNombre: 'Servicios', monto: 700, porcentaje: 21.9 },
  ];

  const mockComparativa: ComparativaMensualDTO[] = [
    { mes: 1, anio: 2026, ingresos: 4500, gastos: 3000 },
    { mes: 2, anio: 2026, ingresos: 4800, gastos: 3100 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // TDD: RED tests

  describe('getResumenMensual', () => {
    it('should call GET /API/dashboard/resumen_mensual with correct params', () => {
      service.getResumenMensual(1, 6, 2026).subscribe(response => {
        expect(response.totalIngresos).toBe(5000.50);
        expect(response.totalGastos).toBe(3200.75);
        expect(response.balance).toBe(1799.75);
      });

      const req = httpMock.expectOne(r =>
        r.url === '/API/dashboard/resumen_mensual' &&
        r.params.get('usuarioId') === '1' &&
        r.params.get('mes') === '6' &&
        r.params.get('anio') === '2026'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResumen);
    });
  });

  describe('getGastosPorCategoria', () => {
    it('should call GET /API/dashboard/gastos_por_categoria and return categorized list', () => {
      service.getGastosPorCategoria(1, 6, 2026).subscribe(response => {
        expect(response.length).toBe(3);
        expect(response[0].categoriaNombre).toBe('Alimentación');
        expect(response[0].porcentaje).toBe(46.9);
      });

      const req = httpMock.expectOne(r =>
        r.url === '/API/dashboard/gastos_por_categoria' &&
        r.params.get('usuarioId') === '1'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCategorias);
    });
  });

  describe('getComparativaMensual', () => {
    it('should call GET /API/dashboard/comparativa_mensual with meses param', () => {
      service.getComparativaMensual(1, 6).subscribe(response => {
        expect(response.length).toBe(2);
        expect(response[0].ingresos).toBe(4500);
      });

      const req = httpMock.expectOne(r =>
        r.url === '/API/dashboard/comparativa_mensual' &&
        r.params.get('usuarioId') === '1' &&
        r.params.get('meses') === '6'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockComparativa);
    });

    it('should default meses to 6 when not provided', () => {
      service.getComparativaMensual(1).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === '/API/dashboard/comparativa_mensual' &&
        r.params.get('meses') === '6'
      );
      req.flush([]);
    });
  });
});
