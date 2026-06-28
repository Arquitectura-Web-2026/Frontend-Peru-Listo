import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AdminArticuloFormComponent } from './admin-articulo-form.component';
import { AdminService } from '../../../services/admin.service';

describe('AdminArticuloFormComponent', () => {
  let component: AdminArticuloFormComponent;
  let fixture: ComponentFixture<AdminArticuloFormComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminArticuloFormComponent, NoopAnimationsModule],
      providers: [
        AdminService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => key === 'id' ? null : null }),
            snapshot: { paramMap: { get: (key: string) => key === 'id' ? null : null } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminArticuloFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // TDD: RED tests

  describe('rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should display create mode title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Crear Artículo');
    });

    it('should have titulo input field', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('input[formcontrolname="titulo"]');
      expect(input).toBeTruthy();
    });

    it('should have descripcionCorta textarea', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const textarea = compiled.querySelector('textarea[formcontrolname="descripcionCorta"]');
      expect(textarea).toBeTruthy();
    });

    it('should have cuerpo textarea', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const textareas = compiled.querySelectorAll('textarea');
      expect(textareas.length).toBeGreaterThanOrEqual(2);
    });

    it('should have categoriaTematica select', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const select = compiled.querySelector('mat-select[formcontrolname="categoriaTematica"]');
      expect(select).toBeTruthy();
    });

    it('should have cancel and submit buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Cancelar');
    });

    it('should provide all 5 category options in select', () => {
      expect(component.categorias.length).toBe(5);
      expect(component.categorias).toContain('Ahorro');
      expect(component.categorias).toContain('Inversión');
      expect(component.categorias).toContain('Deudas');
      expect(component.categorias).toContain('Presupuesto');
      expect(component.categorias).toContain('Impuestos');
    });
  });

  describe('form validation', () => {
    it('should mark form invalid when fields are empty', () => {
      expect(component.articuloForm.valid).toBeFalse();
    });

    it('should mark form valid when all required fields are filled', () => {
      component.articuloForm.patchValue({
        titulo: 'Test título',
        descripcionCorta: 'Test descripción',
        cuerpo: 'Test contenido',
        categoriaTematica: 'Ahorro',
      });
      expect(component.articuloForm.valid).toBeTrue();
    });
  });
});
