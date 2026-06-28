import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ArticuloListComponent } from './articulo-list.component';
import { ArticuloService } from '../../services/articulo.service';

describe('ArticuloListComponent', () => {
  let component: ArticuloListComponent;
  let fixture: ComponentFixture<ArticuloListComponent>;
  let articuloService: ArticuloService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticuloListComponent, NoopAnimationsModule],
      providers: [
        ArticuloService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'educacion', component: ArticuloListComponent },
          { path: 'educacion/:id', component: ArticuloListComponent },
        ]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticuloListComponent);
    component = fixture.componentInstance;
    articuloService = TestBed.inject(ArticuloService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // TDD: RED tests

  describe('rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should display page title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Educación Financiera');
    });

    it('should render category filter buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Todos');
      expect(compiled.textContent).toContain('Ahorro');
      expect(compiled.textContent).toContain('Inversión');
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when loading is true', () => {
      articuloService.loading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });

    it('should hide spinner when loading is false and data present', () => {
      articuloService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-spinner')).toBeFalsy();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no articles', () => {
      articuloService.articulos.set([]);
      articuloService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sin artículos disponibles');
    });
  });

  describe('error state', () => {
    it('should show error message when error is set', () => {
      articuloService.error.set('Error de conexión');
      articuloService.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Error de conexión');
    });
  });
});
