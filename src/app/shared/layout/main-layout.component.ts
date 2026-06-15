import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { NAV_ITEMS } from './nav-items';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="app-logo">account_balance</mat-icon>
          <span class="app-title">PresuListo</span>
        </div>

        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a mat-list-item
               [routerLink]="[item.route]"
               routerLinkActive="active-link"
               [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <span class="toolbar-title">PresuListo</span>
          <span class="toolbar-spacer"></span>
          <button mat-icon-button (click)="logout()" title="Cerrar sesión">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <div class="content-area">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
    }
    .sidenav {
      width: 250px;
      background-color: #fafafa;
      border-right: 1px solid rgba(0,0,0,0.12);
    }
    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 16px 16px;
      border-bottom: 1px solid rgba(0,0,0,0.08);
    }
    .app-logo {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #3f51b5;
    }
    .app-title {
      font-size: 20px;
      font-weight: 600;
      color: #3f51b5;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .toolbar-title {
      font-weight: 500;
    }
    .toolbar-spacer {
      flex: 1 1 auto;
    }
    .content-area {
      padding: 0;
      min-height: calc(100vh - 64px);
    }
    .active-link {
      background-color: rgba(63, 81, 181, 0.1) !important;
      color: #3f51b5 !important;
    }
    .active-link mat-icon {
      color: #3f51b5 !important;
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  navItems = NAV_ITEMS;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
