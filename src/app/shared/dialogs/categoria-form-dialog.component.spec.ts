import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CategoriaFormDialogComponent } from './categoria-form-dialog.component';
import { By } from '@angular/platform-browser';
import { CategoriaDTO } from '../../models/gasto.models';

describe('CategoriaFormDialogComponent', () => {
  let component: CategoriaFormDialogComponent;
  let fixture: ComponentFixture<CategoriaFormDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CategoriaFormDialogComponent>>;
  let httpMock: HttpTestingController;

  const dialogData = { usuarioId: 1 };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj<MatDialogRef<CategoriaFormDialogComponent>>('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        CategoriaFormDialogComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaFormDialogComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default colorHex #3f51b5', () => {
    expect(component.form.get('colorHex')?.value).toBe('#3f51b5');
    expect(component.form.get('nombre')?.value).toBe('');
  });

  it('should mark nombre as required', () => {
    const nombreControl = component.form.get('nombre');
    nombreControl?.setValue('');
    nombreControl?.markAsTouched();
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('mat-error'));
    expect(matError).toBeTruthy();
    expect(matError.nativeElement.textContent).toContain('obligatorio');
  });

  it('should close dialog with null on cancel', () => {
    const cancelButton = fixture.debugElement.query(By.css('button[type="button"]'));
    cancelButton.nativeElement.click();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(null);
  });

  it('should call POST /API/crear_categoria and close dialog with created DTO on valid submit', () => {
    component.form.patchValue({ nombre: 'Suscripciones', colorHex: '#9c27b0' });
    fixture.detectChanges();

    const expectedCreated: CategoriaDTO = {
      id: 10,
      nombre: 'Suscripciones',
      tipo: 'gasto',
      colorHex: '#9c27b0',
      usuarioId: dialogData.usuarioId,
      esPredeterminada: false,
    };

    const formEl = fixture.debugElement.query(By.css('form'));
    formEl.triggerEventHandler('submit', null);

    const req = httpMock.expectOne('/API/crear_categoria');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nombre: 'Suscripciones',
      tipo: 'gasto',
      colorHex: '#9c27b0',
      usuarioId: dialogData.usuarioId,
    });
    req.flush(expectedCreated);

    expect(dialogRefSpy.close).toHaveBeenCalledWith(expectedCreated);
  });

  it('should NOT close dialog on invalid submit (empty nombre)', () => {
    component.form.patchValue({ nombre: '', colorHex: '#ff0000' });
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', null);

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });
});
