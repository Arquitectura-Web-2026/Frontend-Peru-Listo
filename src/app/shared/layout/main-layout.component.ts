import { Component, inject, signal, computed } from '@angular/core';
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
    <mat-sidenav-container class="layout-container" autosize>

      <mat-sidenav mode="side" opened class="sidenav" [class.collapsed-sidenav]="isCollapsed()">

        <div class="sidenav-header">
          <div class="logo-and-title">
            <mat-icon class="app-logo">account_balance</mat-icon>
            @if (!isCollapsed()) {
              <span class="app-title">PresuListo</span>
            }
          </div>

          <button mat-icon-button (click)="toggleSidenav()" class="menu-toggle-btn" title="Alternar menú">
            <mat-icon>menu</mat-icon>
          </button>
        </div>

        <mat-nav-list>
          @for (item of navItems(); track item.route) {
            <a mat-list-item
               [routerLink]="[item.route]"
               routerLinkActive="active-link"
               [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
               [title]="isCollapsed() ? item.label : ''">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              @if (!isCollapsed()) {
                <span matListItemTitle>{{ item.label }}</span>
              }
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="main-content-layout">
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
    :host {
      /* Definimos los anchos del menú usando variables para evitar desfases */
      --sidenav-width: 250px;
    }

    .layout-container {
      height: 100vh;
      width: 100%;
    }

    /* Estado inicial de la barra lateral */
    .sidenav {
      width: var(--sidenav-width) !important;
      background-color: #fafafa;
      border-right: 1px solid rgba(0,0,0,0.12);
      transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    /* Estado colapsado (Actualiza la variable del ancho) */
    .sidenav.collapsed-sidenav {
      width: 70px !important;
      --sidenav-width: 70px;
    }

    /* Estilo de la cabecera del menú lateral */
    .sidenav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      height: 64px;
      box-sizing: border-box;
    }

    /* Alineación interna del Logo + Texto */
    .logo-and-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Reajuste de la cabecera cuando el menú se encoje */
    .sidenav.collapsed-sidenav .sidenav-header {
      justify-content: center;
      padding: 16px 0;
    }

    /* Ocultar el logo para dejar únicamente el botón de hamburguesa centrado al colapsar */
    .sidenav.collapsed-sidenav .logo-and-title {
      display: none;
    }

    .app-logo {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #3f51b5;
    }

    .app-title {
      font-size: 18px;
      font-weight: 600;
      color: #3f51b5;
      white-space: nowrap;
    }

    .menu-toggle-btn {
      color: #555555;
    }

    /* Contenedor de la derecha */
    .main-content-layout {
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      /* Forzamos a que el margen izquierdo responda a la par con la animación */
      transition: margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      width: 100%;
    }

    .toolbar-title {
      font-weight: 500;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    /* Espaciado del contenedor general */
    .content-area {
      padding: 24px;
      background-color: #ffffff;
    }

    .active-link {
      background-color: rgba(63, 81, 181, 0.1) !important;
      color: #3f51b5 !important;
    }
    .active-link mat-icon {
      color: #3f51b5 !important;
    }

    /* Asegura que los iconos queden perfectamente centrados al reducir el ancho */
    .sidenav.collapsed-sidenav ::v-deep .mat-mdc-list-item-item {
      justify-content: center;
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = signal<boolean>(false);
  navItems = computed(() =>
    NAV_ITEMS.filter(item => !item.requiresAdmin || this.authService.isAdmin())
  );

  toggleSidenav(): void {
    this.isCollapsed.update(val => !val);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
