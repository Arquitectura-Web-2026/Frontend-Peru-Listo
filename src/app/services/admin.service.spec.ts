import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminService } from './admin.service';
import { AdminDashboardDTO, AdminUsuarioDTO, AdminUsuarioDetalleDTO } from '../models/admin.models';
import { ArticuloEducacionDTO } from '../models/articulo.models';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const mockDashboard: AdminDashboardDTO = {
    totalUsuarios: 150,
    usuariosNuevosEsteMes: 12,
    totalTransacciones: 2340,
    totalGastosSistema: 45000.50,
    totalIngresosSistema: 67000.75,
    totalDeudasPendientes: 12000,
    totalMetasAhorro: 85
  };

  const mockUsuarios: AdminUsuarioDTO[] = [
    {
      id: 1,
      nombreCompleto: 'Juan Pérez',
      correo: 'juan@test.com',
      role: 'ROLE_USER',
      fechaRegistro: '2026-01-15',
      totalGastos: 5000,
      totalIngresos: 8000,
      totalDeudas: 2000
    },
    {
      id: 2,
      nombreCompleto: 'Admin User',
      correo: 'admin@test.com',
      role: 'ROLE_ADMIN',
      fechaRegistro: '2026-01-01',
      totalGastos: 3000,
      totalIngresos: 10000,
      totalDeudas: 0
    },
  ];

  const mockUsuarioDetalle: AdminUsuarioDetalleDTO = {
    id: 1,
    nombreCompleto: 'Juan Pérez',
    correo: 'juan@test.com',
    role: 'ROLE_USER',
    fechaRegistro: '2026-01-15',
    totalGastos: 5000,
    totalIngresos: 8000,
    totalDeudas: 2000,
    totalMetas: 3,
    totalPresupuestos: 2
  };

  const mockArticulo: ArticuloEducacionDTO = {
    id: 1,
    titulo: 'Nuevo artículo',
    descripcionCorta: 'Descripción corta',
    cuerpo: '<p>Contenido</p>',
    categoriaTematica: 'Ahorro',
    fechaPublicacion: '2026-06-20'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // TDD: RED tests

  describe('getDashboard', () => {
    it('should call GET /API/admin/dashboard and set dashboard signal', () => {
      service.getDashboard().subscribe(response => {
        expect(response.totalUsuarios).toBe(150);
        expect(response.usuariosNuevosEsteMes).toBe(12);
        expect(response.totalMetasAhorro).toBe(85);
      });

      const req = httpMock.expectOne('/API/admin/dashboard');
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboard);

      expect(service.dashboard()?.totalUsuarios).toBe(150);
    });
  });

  describe('getUsuarios', () => {
    it('should call GET /API/admin/usuarios and set usuarios signal', () => {
      service.getUsuarios().subscribe(response => {
        expect(response.length).toBe(2);
        expect(response[0].nombreCompleto).toBe('Juan Pérez');
        expect(response[1].role).toBe('ROLE_ADMIN');
      });

      const req = httpMock.expectOne('/API/admin/usuarios');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuarios);

      expect(service.usuarios().length).toBe(2);
    });
  });

  describe('getUsuarioDetalle', () => {
    it('should call GET /API/admin/usuarios/{id} and return detail', () => {
      service.getUsuarioDetalle(1).subscribe(response => {
        expect(response.id).toBe(1);
        expect(response.nombreCompleto).toBe('Juan Pérez');
        expect(response.totalMetas).toBe(3);
        expect(response.totalPresupuestos).toBe(2);
      });

      const req = httpMock.expectOne('/API/admin/usuarios/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuarioDetalle);
    });
  });

  describe('createArticulo', () => {
    it('should call POST /API/admin/articulos with DTO', () => {
      const dto: ArticuloEducacionDTO = {
        titulo: 'Nuevo artículo',
        descripcionCorta: 'Descripción corta',
        cuerpo: '<p>Contenido</p>',
        categoriaTematica: 'Ahorro',
      };

      service.createArticulo(dto).subscribe(response => {
        expect(response.titulo).toBe('Nuevo artículo');
        expect(response.id).toBe(1);
      });

      const req = httpMock.expectOne('/API/admin/articulos');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockArticulo);
    });
  });

  describe('updateArticulo', () => {
    it('should call PUT /API/admin/articulos/{id} with DTO', () => {
      const dto: ArticuloEducacionDTO = {
        titulo: 'Artículo actualizado',
        descripcionCorta: 'Desc actualizada',
        cuerpo: '<p>Contenido nuevo</p>',
        categoriaTematica: 'Inversión',
      };

      service.updateArticulo(1, dto).subscribe(response => {
        expect(response.titulo).toBe('Nuevo artículo');
      });

      const req = httpMock.expectOne('/API/admin/articulos/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush(mockArticulo);
    });
  });

  describe('deleteArticulo', () => {
    it('should call DELETE /API/admin/articulos/{id}', () => {
      service.deleteArticulo(1).subscribe(response => {
        expect(response.message).toBe('Artículo eliminado exitosamente');
      });

      const req = httpMock.expectOne('/API/admin/articulos/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Artículo eliminado exitosamente' });
    });
  });

  describe('loadAdminDashboard', () => {
    it('should call both dashboard and usuarios endpoints', () => {
      service.loadAdminDashboard();

      const dashReq = httpMock.expectOne('/API/admin/dashboard');
      dashReq.flush(mockDashboard);

      const usuariosReq = httpMock.expectOne('/API/admin/usuarios');
      usuariosReq.flush(mockUsuarios);

      expect(service.dashboard()?.totalUsuarios).toBe(150);
      expect(service.usuarios().length).toBe(2);
    });

    it('should set loading to true while fetching and false after', () => {
      service.loadAdminDashboard();

      expect(service.loading()).toBeTrue();

      const dashReq = httpMock.expectOne('/API/admin/dashboard');
      dashReq.flush(mockDashboard);

      const usuariosReq = httpMock.expectOne('/API/admin/usuarios');
      usuariosReq.flush(mockUsuarios);

      expect(service.loading()).toBeFalse();
    });
  });
});
