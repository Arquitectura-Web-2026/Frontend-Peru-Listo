import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetaFormComponent } from './meta-form.component';
import { MetaAhorroService } from '../../services/meta-ahorro.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { MetaAhorroDTO } from '../../models/meta.models';

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

describe('MetaFormComponent', () => {
  let component: MetaFormComponent;
  let fixture: ComponentFixture<MetaFormComponent>;
  let metaService: MetaAhorroService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.setItem('userId', '1');

    await TestBed.configureTestingModule({
      imports: [MetaFormComponent, NoopAnimationsModule],
      providers: [
        MetaAhorroService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'metas', component: {} as any },
          { path: 'metas/nuevo', component: MetaFormComponent },
          { path: 'metas/:id/editar', component: MetaFormComponent },
        ]),
        {
          provide: ActivatedRoute,
          useValue: createActivatedRouteOverride(null)
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetaFormComponent);
    component = fixture.componentInstance;
    metaService = TestBed.inject(MetaAhorroService);
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

    it('should display "Crear Meta de Ahorro" title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Crear Meta de Ahorro');
    });

    it('should render form fields: nombre, montoObjetivo, fechaLimite', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const fields = compiled.querySelectorAll('mat-form-field');
      expect(fields.length).toBeGreaterThanOrEqual(3);
    });

    it('should disable submit when form invalid', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const submitBtn = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitBtn.disabled).toBeTrue();
    });
  });

  describe('validation', () => {
    it('should require nombre', () => {
      const ctrl = component.metaForm.get('nombre');
      ctrl?.setValue('');
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
      expect(ctrl?.hasError('required')).toBeTrue();
    });

    it('should require montoObjetivo with min 0', () => {
      const ctrl = component.metaForm.get('montoObjetivo');
      ctrl?.setValue(-10);
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
      expect(ctrl?.hasError('min')).toBeTrue();
    });

    it('should require fechaLimite', () => {
      const ctrl = component.metaForm.get('fechaLimite');
      ctrl?.setValue(null);
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
      expect(ctrl?.hasError('required')).toBeTrue();
    });

    it('should be valid when all fields filled correctly', () => {
      component.metaForm.patchValue({
        nombre: 'Ahorro Vacaciones',
        montoObjetivo: 5000,
        fechaLimite: '2026-12-31'
      });
      expect(component.metaForm.valid).toBeTrue();
    });
  });

  describe('create submission', () => {
    it('should call createMeta on valid form and send POST', () => {
      const createSpy = spyOn(metaService, 'createMeta').and.callThrough();

      component.metaForm.patchValue({
        nombre: 'Ahorro Vacaciones',
        montoObjetivo: 5000,
        fechaLimite: '2026-12-31'
      });
      component.onSubmit();

      const req = httpMock.expectOne('/API/crear_meta');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.nombre).toBe('Ahorro Vacaciones');
      req.flush({
        id: 1, nombre: 'Ahorro Vacaciones', montoObjetivo: 5000, montoActual: 0,
        fechaLimite: '2026-12-31', estado: 'ACTIVA', usuarioId: 1
      });

      expect(createSpy).toHaveBeenCalled();
    });

    it('should not submit when form is invalid', () => {
      const createSpy = spyOn(metaService, 'createMeta');
      component.onSubmit();
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should navigate to /metas on cancel', () => {
      const navigateSpy = spyOn(router, 'navigate');
      const compiled = fixture.nativeElement as HTMLElement;
      const cancelBtn = compiled.querySelector('button[type="button"]') as HTMLButtonElement;
      expect(cancelBtn).toBeTruthy();
      cancelBtn.click();
      expect(navigateSpy).toHaveBeenCalledWith(['/metas']);
    });
  });

  describe('edit mode', () => {
    let editFixture: ComponentFixture<MetaFormComponent>;
    let editComponent: MetaFormComponent;
    let editMetaService: MetaAhorroService;
    let editHttpMock: HttpTestingController;

    beforeEach(async () => {
      localStorage.setItem('userId', '1');

      await TestBed.configureTestingModule({
        imports: [MetaFormComponent, NoopAnimationsModule],
        providers: [
          MetaAhorroService,
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([
            { path: 'metas', component: {} as any },
            { path: 'metas/nuevo', component: MetaFormComponent },
            { path: 'metas/:id/editar', component: MetaFormComponent },
          ]),
          {
            provide: ActivatedRoute,
            useValue: createActivatedRouteOverride({ id: '7' })
          },
        ]
      }).compileComponents();

      editFixture = TestBed.createComponent(MetaFormComponent);
      editComponent = editFixture.componentInstance;
      editMetaService = TestBed.inject(MetaAhorroService);
      editHttpMock = TestBed.inject(HttpTestingController);

      const existing: MetaAhorroDTO = {
        id: 7, nombre: 'Auto Nuevo', montoObjetivo: 30000, montoActual: 10000,
        fechaLimite: '2027-06-01', estado: 'ACTIVA', usuarioId: 1
      };
      editMetaService.metas.set([existing]);

      editFixture.detectChanges();
    });

    afterEach(() => {
      editHttpMock.verify();
      localStorage.clear();
    });

    it('should display "Editar Meta de Ahorro" title', () => {
      const compiled = editFixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Editar Meta de Ahorro');
    });

    it('should be in edit mode', () => {
      expect(editComponent.isEditMode).toBeTrue();
    });

    it('should populate form with existing values', () => {
      expect(editComponent.metaForm.get('nombre')?.value).toBe('Auto Nuevo');
      expect(editComponent.metaForm.get('montoObjetivo')?.value).toBe(30000);
    });

    it('should call updateMeta on submit with PUT', () => {
      const updateSpy = spyOn(editMetaService, 'updateMeta').and.callThrough();

      editComponent.metaForm.patchValue({
        nombre: 'Auto Nuevo 2027',
        montoObjetivo: 35000,
        fechaLimite: '2027-06-01'
      });
      editComponent.onSubmit();

      const req = editHttpMock.expectOne('/API/editar_meta/7');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.nombre).toBe('Auto Nuevo 2027');
      req.flush({
        id: 7, nombre: 'Auto Nuevo 2027', montoObjetivo: 35000, montoActual: 10000,
        fechaLimite: '2027-06-01', estado: 'ACTIVA', usuarioId: 1
      });

      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
