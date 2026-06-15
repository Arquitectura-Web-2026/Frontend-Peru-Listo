import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeudaListComponent } from './deuda-list.component';
import { DeudaService } from '../../services/deuda.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { DeudaDTO } from '../../models/deuda.models';

describe('DeudaListComponent', () => {
  let component: DeudaListComponent;
  let fixture: ComponentFixture<DeudaListComponent>;
  let deudaService: DeudaService;
  let httpMock: HttpTestingController;

  const mockDeudas: DeudaDTO[] = [
    { id: 1, acreedor: 'Banco XYZ', monto: 5000, fechaLimite: '2026-07-15', estado: 'PENDIENTE', usuarioId: 1 },
    { id: 2, acreedor: 'Tarjeta ABC', monto: 2000, fechaLimite: '2026-06-20', estado: 'PAGADA', usuarioId: 1 },
  ];

  beforeEach(async () => {
    localStorage.setItem('userId', '1');

    await TestBed.configureTestingModule({
      imports: [DeudaListComponent, NoopAnimationsModule],
      providers: [
        DeudaService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeudaListComponent);
    component = fixture.componentInstance;
    deudaService = TestBed.inject(DeudaService);
    httpMock = TestBed.inject(HttpTestingController);

    deudaService.deudas.set(mockDeudas);
    deudaService.loading.set(false);
    deudaService.error.set(null);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should display title "Deudas"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Deudas');
    });

    it('should render table rows for each debt', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Banco XYZ');
      expect(compiled.textContent).toContain('Tarjeta ABC');
    });

    it('should display estado chips', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('PENDIENTE');
      expect(compiled.textContent).toContain('PAGADA');
    });
  });

  describe('loading state', () => {
    it('should show loading spinner', () => {
      deudaService.loading.set(true);
      deudaService.deudas.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('should show empty message', () => {
      deudaService.deudas.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sin deudas');
    });
  });

  describe('marcar pagada', () => {
    it('should call marcarPagada on service', () => {
      const spy = spyOn(deudaService, 'marcarPagada').and.callThrough();

      component.marcarPagada(1);

      const req = httpMock.expectOne('/API/marcar_pagada/1');
      expect(req.request.method).toBe('PUT');
      req.flush({ ...mockDeudas[0], estado: 'PAGADA' });

      expect(spy).toHaveBeenCalledWith(1);
    });
  });

  describe('delete', () => {
    it('should call deleteDeuda on confirmed delete', () => {
      const spy = spyOn(deudaService, 'deleteDeuda').and.callThrough();
      spyOn(window, 'confirm').and.returnValue(true);

      component.confirmDelete(1);

      const req = httpMock.expectOne('/API/eliminar_deuda/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(spy).toHaveBeenCalledWith(1);
    });
  });
});
