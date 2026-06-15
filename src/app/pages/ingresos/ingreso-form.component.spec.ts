import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngresoFormComponent } from './ingreso-form.component';
import { IngresoService } from '../../services/ingreso.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('IngresoFormComponent', () => {
  let component: IngresoFormComponent;
  let fixture: ComponentFixture<IngresoFormComponent>;
  let ingresoService: IngresoService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('userId', '1');

    await TestBed.configureTestingModule({
      imports: [IngresoFormComponent, NoopAnimationsModule],
      providers: [
        IngresoService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { params: of({}), snapshot: { params: {}, paramMap: { get: () => null } } }
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoFormComponent);
    component = fixture.componentInstance;
    ingresoService = TestBed.inject(IngresoService);
    httpMock = TestBed.inject(HttpTestingController);

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

    it('should display "Registrar Ingreso" title in create mode', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Registrar Ingreso');
    });

    it('should render form fields', () => {
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
    it('should require descripcion', () => {
      const ctrl = component.ingresoForm.get('descripcion');
      ctrl?.setValue('');
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
      expect(ctrl?.hasError('required')).toBeTrue();
    });

    it('should require monto with min 0', () => {
      const ctrl = component.ingresoForm.get('monto');
      ctrl?.setValue(-10);
      ctrl?.markAsTouched();
      expect(ctrl?.valid).toBeFalse();
      expect(ctrl?.hasError('min')).toBeTrue();
    });

    it('should be valid when all fields filled correctly', () => {
      component.ingresoForm.patchValue({
        descripcion: 'Test ingreso',
        monto: 1000,
        fecha: '2026-06-10'
      });
      expect(component.ingresoForm.valid).toBeTrue();
    });
  });

  describe('create submission', () => {
    it('should call createIngreso on valid form submission', () => {
      const createSpy = spyOn(ingresoService, 'createIngreso').and.callThrough();

      component.ingresoForm.patchValue({
        descripcion: 'Bono',
        monto: 500,
        fecha: '2026-06-10'
      });
      component.onSubmit();

      const req = httpMock.expectOne('/API/registrar_ingreso');
      expect(req.request.method).toBe('POST');
      req.flush({ id: 1, descripcion: 'Bono', monto: 500, fecha: '2026-06-10', usuarioId: 1 });

      expect(createSpy).toHaveBeenCalled();
    });

    it('should not submit when form is invalid', () => {
      const createSpy = spyOn(ingresoService, 'createIngreso');
      component.onSubmit();
      expect(createSpy).not.toHaveBeenCalled();
    });
  });
});
