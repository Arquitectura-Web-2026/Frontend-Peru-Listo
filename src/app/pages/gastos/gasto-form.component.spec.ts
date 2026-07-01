import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GastoFormComponent } from './gasto-form.component';
import { GastoService } from '../../services/gasto.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CategoriaDTO } from '../../models/gasto.models';
import { CategoriaFormDialogComponent } from '../../shared/dialogs/categoria-form-dialog.component';

describe('GastoFormComponent', () => {
  let component: GastoFormComponent;
  let fixture: ComponentFixture<GastoFormComponent>;
  let gastoService: GastoService;
  let categoriaService: CategoriaService;
  let httpMock: HttpTestingController;

  const mockCategorias: CategoriaDTO[] = [
    { id: 1, nombre: 'Alimentación', tipo: 'GASTO', colorHex: '#4caf50', esPredeterminada: true, usuarioId: 1 },
    { id: 2, nombre: 'Transporte', tipo: 'GASTO', colorHex: '#ff9800', esPredeterminada: true, usuarioId: 1 },
  ];

  beforeEach(async () => {
    localStorage.setItem('userId', '1');

    await TestBed.configureTestingModule({
      imports: [GastoFormComponent, NoopAnimationsModule],
      providers: [
        GastoService,
        CategoriaService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { params: of({}), snapshot: { params: {} } }
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GastoFormComponent);
    component = fixture.componentInstance;
    gastoService = TestBed.inject(GastoService);
    categoriaService = TestBed.inject(CategoriaService);
    httpMock = TestBed.inject(HttpTestingController);

    categoriaService.categorias.set(mockCategorias);

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

    it('should display "Crear Gasto" title in create mode', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Crear Gasto');
    });

    it('should render form fields: category, description, amount, date', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      // MatFormFields exist
      const fields = compiled.querySelectorAll('mat-form-field');
      expect(fields.length).toBeGreaterThanOrEqual(4);
    });

    it('should disable submit button when form is invalid', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const submitBtn = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(submitBtn.disabled).toBeTrue();
    });
  });

  describe('validation', () => {
    it('should require descripcion', () => {
      const descripcionControl = component.gastoForm.get('descripcion');
      descripcionControl?.setValue('');
      descripcionControl?.markAsTouched();
      expect(descripcionControl?.valid).toBeFalse();
      expect(descripcionControl?.hasError('required')).toBeTrue();
    });

    it('should require monto with min 0', () => {
      const montoControl = component.gastoForm.get('monto');
      montoControl?.setValue(-5);
      montoControl?.markAsTouched();
      expect(montoControl?.valid).toBeFalse();
      expect(montoControl?.hasError('min')).toBeTrue();
    });

    it('should require categoriaId', () => {
      const categoriaControl = component.gastoForm.get('categoriaId');
      categoriaControl?.setValue(null);
      categoriaControl?.markAsTouched();
      expect(categoriaControl?.valid).toBeFalse();
    });

    it('should be valid when all fields are filled correctly', () => {
      component.gastoForm.patchValue({
        descripcion: 'Test gasto',
        monto: 100,
        categoriaId: 1,
        fechagasto: '2026-06-10'
      });
      expect(component.gastoForm.valid).toBeTrue();
    });
  });

  describe('create submission', () => {
    it('should call createGasto on valid form submission', () => {
      const createSpy = spyOn(gastoService, 'createGasto').and.callThrough();

      component.gastoForm.patchValue({
        descripcion: 'Nuevo gasto',
        monto: 50.75,
        categoriaId: 1,
        fechagasto: '2026-06-10'
      });
      component.onSubmit();

      const req = httpMock.expectOne('/API/registrar_gasto');
      expect(req.request.method).toBe('POST');
      req.flush({
        id: 1, descripcion: 'Nuevo gasto', monto: 50.75,
        fechagasto: '2026-06-10', usuarioId: 1, categoriaId: 1
      });

      expect(createSpy).toHaveBeenCalled();
    });

    it('should not submit when form is invalid', () => {
      const createSpy = spyOn(gastoService, 'createGasto');
      component.onSubmit();
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('quick-add category button', () => {
    it('should open CategoriaFormDialogComponent when "+" button is clicked', () => {
      // Get the MatDialog service from the injector
      const dialog = TestBed.inject(MatDialog);
      const dialogSpy = spyOn(dialog, 'open').and.returnValue({
        afterClosed: () => of(null),
      } as any);

      // Find and click the "+" button next to the categoria select
      const compiled = fixture.nativeElement as HTMLElement;
      const addButton = compiled.querySelector('[data-testid="quick-add-categoria"]') as HTMLButtonElement;
      expect(addButton).toBeTruthy();
      addButton.click();

      expect(dialogSpy).toHaveBeenCalledWith(
        CategoriaFormDialogComponent,
        { width: '400px', data: { usuarioId: 1 } }
      );
    });
  });
});
