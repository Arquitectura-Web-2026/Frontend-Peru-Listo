import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeudaFormComponent } from './deuda-form.component';
import { DeudaService } from '../../services/deuda.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { DeudaDTO } from '../../models/deuda.models';

function createActivatedRouteOverride(params: Record<string, string> | null) {
  return {
    params: of(params ?? {}),
    snapshot: {
      params: params ?? {},
      paramMap: {
        get: (key: string) => params ? params[key] ?? null : null
      }
    }
  };
}

describe('DeudaFormComponent', () => {
  let component: DeudaFormComponent;
  let fixture: ComponentFixture<DeudaFormComponent>;
  let deudaService: DeudaService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.setItem('userId', '1');

    await TestBed.configureTestingModule({
      imports: [DeudaFormComponent, NoopAnimationsModule],
      providers: [
        DeudaService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'deudas', component: {} as any },
          { path: 'deudas/nuevo', component: DeudaFormComponent },
          { path: 'deudas/:id/editar', component: DeudaFormComponent },
        ]),
        {
          provide: ActivatedRoute,
          useValue: { params: of({}), snapshot: { params: {}, paramMap: { get: () => null } } }
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeudaFormComponent);
    component = fixture.componentInstance;
    deudaService = TestBed.inject(DeudaService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('create mode rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should display "Registrar Deuda" title in create mode', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Registrar Deuda');
    });

    it('should render form fields: acreedor, monto, fechaLimite', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const fields = compiled.querySelectorAll('mat-form-field');
      expect(fields.length).toBeGreaterThanOrEqual(3);
    });

    it('should disable submit button when form is invalid', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const submitBtn = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitBtn.disabled).toBeTrue();
    });
  });

  describe('validation', () => {
    it('should require acreedor', () => {
      const ctrl = component.deudaForm.get('acreedor');
      ctrl?.setValue('');
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
      expect(ctrl?.hasError('required')).toBeTrue();
    });

    it('should require monto with min 0', () => {
      const ctrl = component.deudaForm.get('monto');
      ctrl?.setValue(-10);
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
      expect(ctrl?.hasError('min')).toBeTrue();
    });

    it('should require fechaLimite', () => {
      const ctrl = component.deudaForm.get('fechaLimite');
      ctrl?.setValue(null);
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
      expect(ctrl?.hasError('required')).toBeTrue();
    });

    it('should be valid when all fields are filled correctly', () => {
      component.deudaForm.patchValue({
        acreedor: 'Banco XYZ',
        monto: 500,
        fechaLimite: '2026-06-10'
      });
      expect(component.deudaForm.valid).toBeTrue();
    });
  });

  describe('create submission', () => {
    it('should call createDeuda on valid form submission and make POST request', () => {
      const createSpy = spyOn(deudaService, 'createDeuda').and.callThrough();

      component.deudaForm.patchValue({
        acreedor: 'Banco XYZ',
        monto: 500,
        fechaLimite: '2026-06-10'
      });
      component.onSubmit();

      const req = httpMock.expectOne('/API/registrar_deuda');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.acreedor).toBe('Banco XYZ');
      expect(req.request.body.estado).toBe('PENDIENTE');
      req.flush({
        id: 1, acreedor: 'Banco XYZ', monto: 500,
        fechaLimite: '2026-06-10', estado: 'PENDIENTE', usuarioId: 1
      });

      expect(createSpy).toHaveBeenCalled();
    });

    it('should not submit when form is invalid', () => {
      const createSpy = spyOn(deudaService, 'createDeuda');
      component.onSubmit();
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should navigate to /deudas on cancel button click', () => {
      const navigateSpy = spyOn(router, 'navigate');
      const compiled = fixture.nativeElement as HTMLElement;
      const cancelBtn = compiled.querySelector('button[type="button"]') as HTMLButtonElement;
      expect(cancelBtn).toBeTruthy();
      cancelBtn.click();
      expect(navigateSpy).toHaveBeenCalledWith(['/deudas']);
    });
  });

  describe('edit mode', () => {
    let editFixture: ComponentFixture<DeudaFormComponent>;
    let editComponent: DeudaFormComponent;
    let editDeudaService: DeudaService;
    let editHttpMock: HttpTestingController;
    let editRouter: Router;

    beforeEach(async () => {
      localStorage.setItem('userId', '1');

      await TestBed.configureTestingModule({
        imports: [DeudaFormComponent, NoopAnimationsModule],
        providers: [
          DeudaService,
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([
            { path: 'deudas', component: {} as any },
            { path: 'deudas/nuevo', component: DeudaFormComponent },
            { path: 'deudas/:id/editar', component: DeudaFormComponent },
          ]),
          {
            provide: ActivatedRoute,
            useValue: createActivatedRouteOverride({ id: '5' })
          },
        ]
      }).compileComponents();

      editFixture = TestBed.createComponent(DeudaFormComponent);
      editComponent = editFixture.componentInstance;
      editDeudaService = TestBed.inject(DeudaService);
      editHttpMock = TestBed.inject(HttpTestingController);
      editRouter = TestBed.inject(Router);

      // Prepopulate the service signal with a debt so edit mode finds it
      const existingDeuda: DeudaDTO = {
        id: 5, acreedor: 'Banco Ripley', monto: 300,
        fechaLimite: '2026-07-15', estado: 'PENDIENTE', usuarioId: 1
      };
      editDeudaService.deudas.set([existingDeuda]);

      editFixture.detectChanges();
    });

    afterEach(() => {
      editHttpMock.verify();
      localStorage.clear();
    });

    it('should display "Editar Deuda" title', () => {
      const compiled = editFixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Editar Deuda');
    });

    it('should be in edit mode', () => {
      expect(editComponent.isEditMode).toBeTrue();
    });

    it('should populate form with existing deuda values', () => {
      expect(editComponent.deudaForm.get('acreedor')?.value).toBe('Banco Ripley');
      expect(editComponent.deudaForm.get('monto')?.value).toBe(300);
    });

    it('should call updateDeuda on submit and make PUT request', () => {
      const updateSpy = spyOn(editDeudaService, 'updateDeuda').and.callThrough();

      editComponent.deudaForm.patchValue({
        acreedor: 'Banco Ripley Editado',
        monto: 400,
        fechaLimite: '2026-08-20'
      });
      editComponent.onSubmit();

      const req = editHttpMock.expectOne('/API/editar_deuda/5');
      expect(req.request.method).toBe('PUT');
      req.flush({
        id: 5, acreedor: 'Banco Ripley Editado', monto: 400,
        fechaLimite: '2026-08-20', estado: 'PENDIENTE', usuarioId: 1
      });

      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
