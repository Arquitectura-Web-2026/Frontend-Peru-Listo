import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AdminUsuarioDetailComponent } from './admin-usuario-detail.component';
import { AdminService } from '../../../services/admin.service';
import { AdminUsuarioDetalleDTO } from '../../../models/admin.models';

describe('AdminUsuarioDetailComponent', () => {
  let component: AdminUsuarioDetailComponent;
  let fixture: ComponentFixture<AdminUsuarioDetailComponent>;
  let httpMock: HttpTestingController;

  const mockDetalle: AdminUsuarioDetalleDTO = {
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsuarioDetailComponent, NoopAnimationsModule],
      providers: [
        AdminService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => key === 'id' ? '1' : null }),
            snapshot: { paramMap: { get: (key: string) => key === 'id' ? '1' : null } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsuarioDetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // TDD: RED tests

  describe('rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should fetch user detail on init', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('/API/admin/usuarios/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetalle);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Juan Pérez');
    });

    it('should display all user detail fields', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('/API/admin/usuarios/1');
      req.flush(mockDetalle);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Juan Pérez');
      expect(compiled.textContent).toContain('juan@test.com');
      expect(compiled.textContent).toContain('ROLE_USER');
      expect(compiled.textContent).toContain('5,000');
      expect(compiled.textContent).toContain('8,000');
      expect(compiled.textContent).toContain('2,000');
      expect(compiled.textContent).toContain('3');
      expect(compiled.textContent).toContain('2');
    });

    it('should have a back button to /admin/usuarios', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('/API/admin/usuarios/1');
      req.flush(mockDetalle);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const backBtn = compiled.querySelector('a[ng-reflect-router-link="/admin/usuarios"], button[ng-reflect-router-link="/admin/usuarios"], a[routerlink="/admin/usuarios"], button[routerlink="/admin/usuarios"]');
      expect(backBtn).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show spinner while fetching', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('should show error when user not found', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('/API/admin/usuarios/1');
      req.flush({ message: 'Usuario no encontrado' }, { status: 404, statusText: 'Not Found' });

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Usuario no encontrado');
    });
  });
});
