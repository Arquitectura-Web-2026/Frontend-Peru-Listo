import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetaListComponent } from './meta-list.component';
import { MetaAhorroService } from '../../services/meta-ahorro.service';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MetaAhorroDTO } from '../../models/meta.models';

describe('MetaListComponent', () => {
  let component: MetaListComponent;
  let fixture: ComponentFixture<MetaListComponent>;
  let metaService: MetaAhorroService;
  let httpMock: HttpTestingController;

  const mockMetas: MetaAhorroDTO[] = [
    { id: 1, nombre: 'Auto', montoObjetivo: 30000, montoActual: 15000, fechaLimite: '2026-12-31', estado: 'ACTIVA', usuarioId: 1 },
    { id: 2, nombre: 'Viaje', montoObjetivo: 5000, montoActual: 5000, fechaLimite: '2026-06-01', estado: 'COMPLETADA', usuarioId: 1 },
  ];

  beforeEach(async () => {
    localStorage.setItem('userId', '1');

    await TestBed.configureTestingModule({
      imports: [MetaListComponent, NoopAnimationsModule],
      providers: [
        MetaAhorroService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetaListComponent);
    component = fixture.componentInstance;
    metaService = TestBed.inject(MetaAhorroService);
    httpMock = TestBed.inject(HttpTestingController);

    metaService.metas.set(mockMetas);
    metaService.loading.set(false);
    metaService.error.set(null);

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

    it('should display title "Metas de Ahorro"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Metas de Ahorro');
    });

    it('should render cards for each goal', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cards = compiled.querySelectorAll('mat-card');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it('should display goal names', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Auto');
      expect(compiled.textContent).toContain('Viaje');
    });

    it('should render progress bars', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const bars = compiled.querySelectorAll('mat-progress-bar');
      expect(bars.length).toBeGreaterThanOrEqual(2);
    });

    it('should display status chips', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('ACTIVA');
    });
  });

  describe('empty state', () => {
    it('should show empty message', () => {
      metaService.metas.set([]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Sin metas de ahorro');
    });
  });
});
