import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '1');
    localStorage.setItem('correo', 'test@test.com');

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent, NoopAnimationsModule],
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'dashboard', component: MainLayoutComponent },
          { path: 'login', component: MainLayoutComponent },
        ]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should display the app title "PresuListo" in toolbar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('PresuListo');
    });

    it('should have a logout button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoutBtn = compiled.querySelector('button');
      expect(logoutBtn).toBeTruthy();
    });

    it('should render router-outlet', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });

    it('should render a mat-toolbar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-toolbar')).toBeTruthy();
    });

    it('should render a mat-sidenav-container', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-sidenav-container')).toBeTruthy();
    });
  });

  describe('logout', () => {
    it('should call authService.logout and navigate to /login', () => {
      const logoutSpy = spyOn(authService, 'logout');
      const navSpy = spyOn(router, 'navigate');

      component.logout();

      expect(logoutSpy).toHaveBeenCalled();
      expect(navSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
