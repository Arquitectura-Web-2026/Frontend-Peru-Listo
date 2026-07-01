import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresupuestoFormComponent } from './presupuesto-form.component';
import { PresupuestoService } from '../../services/presupuesto.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { PresupuestoDTO } from '../../models/presupuesto.models';
import { CategoriaDTO } from '../../models/gasto.models';

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

describe('PresupuestoFormComponent', () => {
  let component: PresupuestoFormComponent;
  let fixture: ComponentFixture<PresupuestoFormComponent>;
  let presupuestoService: PresupuestoService;
  let categoriaService: CategoriaService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockCategorias: CategoriaDTO[] = [
    { id: 1, nombre: 'Alimentación', tipo: 'GASTO', colorHex: '#4caf50', esPredeterminada: true, usuarioId: 1 },
    { id: 2, nombre: 'Transporte', tipo: 'GASTO', colorHex: '#ff9800', esPredeterminada: true, usuarioId: 1 },
  ];

  beforeEach(async () => {
    localStorage.setItem('userId', '1');

    await TestBed.configureTestingModule({
      imports: [PresupuestoFormComponent, NoopAnimationsModule],
      providers: [
        PresupuestoService,
        CategoriaService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'presupuestos', component: {} as any },
          { path: 'presupuestos/nuevo', component: PresupuestoFormComponent },
          { path: 'presupuestos/:id/editar', component: PresupuestoFormComponent },
        ]),
        {
          provide: ActivatedRoute,
          useValue: createActivatedRouteOverride(null)
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PresupuestoFormComponent);
    component = fixture.componentInstance;
    presupuestoService = TestBed.inject(PresupuestoService);
    categoriaService = TestBed.inject(CategoriaService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    categoriaService.categorias.set(mockCategorias);

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

    it('should display "Crear Presupuesto" title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Crear Presupuesto');
    });

    it('should render form fields: categoria, mes, anio, montoLimite', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const fields = compiled.querySelectorAll('mat-form-field');
      expect(fields.length).toBeGreaterThanOrEqual(4);
    });

    it('should default mes and anio to current month/year', () => {
      const now = new Date();
      expect(component.presupuestoForm.get('mes')?.value).toBe(now.getMonth() + 1);
      expect(component.presupuestoForm.get('anio')?.value).toBe(now.getFullYear());
    });

    it('should disable submit when form invalid', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const submitBtn = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitBtn.disabled).toBeTrue();
    });
  });

  describe('validation', () => {
    it('should require categoriaId', () => {
      const ctrl = component.presupuestoForm.get('categoriaId');
      ctrl?.setValue(null);
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
      expect(ctrl?.hasError('required')).toBeTrue();
    });

    it('should require mes between 1 and 12', () => {
      const ctrl = component.presupuestoForm.get('mes');
      ctrl?.setValue(0);
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
    });

    it('should require anio', () => {
      const ctrl = component.presupuestoForm.get('anio');
      ctrl?.setValue(null);
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
      expect(ctrl?.hasError('required')).toBeTrue();
    });

    it('should require montoLimite with min 0', () => {
      const ctrl = component.presupuestoForm.get('montoLimite');
      ctrl?.setValue(-10);
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
      expect(ctrl?.hasError('min')).toBeTrue();
    });

    it('should be valid when all fields filled correctly', () => {
      component.presupuestoForm.patchValue({
        categoriaId: 1,
        mes: 6,
        anio: 2026,
        montoLimite: 1000
      });
      expect(component.presupuestoForm.valid).toBeTrue();
    });
  });

  describe('create submission', () => {
    it('should call createPresupuesto on valid form and send POST', () => {
      const createSpy = spyOn(presupuestoService, 'createPresupuesto').and.callThrough();

      component.presupuestoForm.patchValue({
        categoriaId: 1,
        mes: 6,
        anio: 2026,
        montoLimite: 1000
      });
      component.onSubmit();

      const req = httpMock.expectOne('/API/crear_presupuesto');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.categoriaId).toBe(1);
      expect(req.request.body.mes).toBe(6);
      req.flush({ id: 1, categoriaId: 1, mes: 6, anio: 2026, montoLimite: 1000, usuarioId: 1 });

      expect(createSpy).toHaveBeenCalled();
    });

    it('should not submit when form is invalid', () => {
      const createSpy = spyOn(presupuestoService, 'createPresupuesto');
      component.onSubmit();
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should navigate to /presupuestos on cancel', () => {
      const navigateSpy = spyOn(router, 'navigate');
      const compiled = fixture.nativeElement as HTMLElement;
      const cancelBtn = compiled.querySelector('button[type="button"]') as HTMLButtonElement;
      expect(cancelBtn).toBeTruthy();
      cancelBtn.click();
      expect(navigateSpy).toHaveBeenCalledWith(['/presupuestos']);
    });
  });

  describe('edit mode', () => {
    let editFixture: ComponentFixture<PresupuestoFormComponent>;
    let editComponent: PresupuestoFormComponent;
    let editPresupuestoService: PresupuestoService;
    let editCategoriaService: CategoriaService;
    let editHttpMock: HttpTestingController;

    beforeEach(async () => {
      localStorage.setItem('userId', '1');

      await TestBed.configureTestingModule({
        imports: [PresupuestoFormComponent, NoopAnimationsModule],
        providers: [
          PresupuestoService,
          CategoriaService,
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([
            { path: 'presupuestos', component: {} as any },
            { path: 'presupuestos/nuevo', component: PresupuestoFormComponent },
            { path: 'presupuestos/:id/editar', component: PresupuestoFormComponent },
          ]),
          {
            provide: ActivatedRoute,
            useValue: createActivatedRouteOverride({ id: '3' })
          },
        ]
      }).compileComponents();

      editFixture = TestBed.createComponent(PresupuestoFormComponent);
      editComponent = editFixture.componentInstance;
      editPresupuestoService = TestBed.inject(PresupuestoService);
      editCategoriaService = TestBed.inject(CategoriaService);
      editHttpMock = TestBed.inject(HttpTestingController);

      editCategoriaService.categorias.set(mockCategorias);

      const existing: PresupuestoDTO = {
        id: 3, categoriaId: 2, mes: 5, anio: 2026, montoLimite: 800, usuarioId: 1
      };
      editPresupuestoService.presupuestos.set([existing]);

      editFixture.detectChanges();
    });

    afterEach(() => {
      editHttpMock.verify();
      localStorage.clear();
    });

    it('should display "Editar Presupuesto" title', () => {
      const compiled = editFixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Editar Presupuesto');
    });

    it('should be in edit mode', () => {
      expect(editComponent.isEditMode).toBeTrue();
    });

    it('should populate form with existing values', () => {
      expect(editComponent.presupuestoForm.get('montoLimite')?.value).toBe(800);
    });

    it('should disable categoria, mes, and anio fields in edit mode', () => {
      expect(editComponent.presupuestoForm.get('categoriaId')?.disabled).toBeTrue();
      expect(editComponent.presupuestoForm.get('mes')?.disabled).toBeTrue();
      expect(editComponent.presupuestoForm.get('anio')?.disabled).toBeTrue();
    });

    it('should call updatePresupuesto with id and monto on submit', () => {
      const updateSpy = spyOn(editPresupuestoService, 'updatePresupuesto').and.callThrough();

      editComponent.presupuestoForm.patchValue({ montoLimite: 1500 });
      editComponent.onSubmit();

      const req = editHttpMock.expectOne(r =>
        r.url === '/API/editar_presupuesto/3' &&
        r.params.get('monto') === '1500'
      );
      expect(req.request.method).toBe('PUT');
      req.flush({ id: 3, categoriaId: 2, mes: 5, anio: 2026, montoLimite: 1500, usuarioId: 1 });

      expect(updateSpy).toHaveBeenCalledWith(3, 1500);
    });
  });
});
