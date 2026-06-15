import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsuarioService } from './usuario.service';
import { UsuarioDTO, PasswordChangeRequest } from '../models/usuario.models';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  const mockUsuario: UsuarioDTO = {
    id: 1,
    nombreCompleto: 'Juan Pérez',
    correo: 'juan@test.com',
    fechaRegistro: '2026-01-15'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsuarioService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPerfil', () => {
    it('should call GET /API/perfil/{id} and populate signal', () => {
      service.getPerfil(1).subscribe(response => {
        expect(response.nombreCompleto).toBe('Juan Pérez');
      });

      const req = httpMock.expectOne('/API/perfil/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuario);

      expect(service.perfil()?.nombreCompleto).toBe('Juan Pérez');
    });

    it('should set error on failure', () => {
      service.getPerfil(1).subscribe({
        error: () => {
          expect(service.error()).toBe('Error al cargar perfil');
        }
      });

      const req = httpMock.expectOne('/API/perfil/1');
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updatePerfil', () => {
    it('should call PUT /API/actualizar_perfil/{id} and update signal', () => {
      const updateDto = { nombreCompleto: 'Juan Actualizado', correo: 'juan2@test.com' };

      service.updatePerfil(1, updateDto).subscribe(response => {
        expect(response.nombreCompleto).toBe('Juan Actualizado');
      });

      const req = httpMock.expectOne('/API/actualizar_perfil/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateDto);
      req.flush({ ...mockUsuario, ...updateDto });

      expect(service.perfil()?.nombreCompleto).toBe('Juan Actualizado');
    });
  });

  describe('cambiarPassword', () => {
    it('should call PUT /API/cambiar_password/{id} with password dto', () => {
      const dto: PasswordChangeRequest = {
        currentPassword: 'old123',
        newPassword: 'new456',
        confirmPassword: 'new456'
      };

      service.cambiarPassword(1, dto).subscribe(response => {
        expect(response.message).toBe('Contraseña cambiada');
      });

      const req = httpMock.expectOne('/API/cambiar_password/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush({ message: 'Contraseña cambiada' });
    });
  });
});
