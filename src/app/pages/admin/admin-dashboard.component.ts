import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  template: `
    <div class="admin-dashboard-container">
      <h1>Panel de Administración</h1>

      @if (adminService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando panel de administración...</p>
        </div>
      }

      @if (adminService.error() && !adminService.loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ adminService.error() }}</p>
          <button mat-raised-button color="primary" (click)="retry()">Reintentar</button>
        </div>
      }

      @if (!adminService.loading() && !adminService.error() && !adminService.dashboard()) {
        <div class="empty-container">
          <mat-icon>dashboard</mat-icon>
          <p>Sin datos disponibles</p>
        </div>
      }

      @if (!adminService.loading() && adminService.dashboard()) {
        <div class="stat-cards">
          <mat-card class="stat-card usuarios-card">
            <mat-card-content>
              <div class="stat-icon"><mat-icon>people</mat-icon></div>
              <div class="stat-value">{{ adminService.dashboard()?.totalUsuarios ?? 0 | number }}</div>
              <div class="stat-label">Total Usuarios</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card nuevos-card">
            <mat-card-content>
              <div class="stat-icon"><mat-icon>person_add</mat-icon></div>
              <div class="stat-value">{{ adminService.dashboard()?.usuariosNuevosEsteMes ?? 0 | number }}</div>
              <div class="stat-label">Nuevos este mes</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card transacciones-card">
            <mat-card-content>
              <div class="stat-icon"><mat-icon>swap_horiz</mat-icon></div>
              <div class="stat-value">{{ adminService.dashboard()?.totalTransacciones ?? 0 | number }}</div>
              <div class="stat-label">Transacciones</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card gastos-card">
            <mat-card-content>
              <div class="stat-icon"><mat-icon>trending_down</mat-icon></div>
              <div class="stat-value">S/ {{ adminService.dashboard()?.totalGastosSistema ?? 0 | number:'1.2-2' }}</div>
              <div class="stat-label">Gastos del Sistema</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card ingresos-card">
            <mat-card-content>
              <div class="stat-icon"><mat-icon>trending_up</mat-icon></div>
              <div class="stat-value">S/ {{ adminService.dashboard()?.totalIngresosSistema ?? 0 | number:'1.2-2' }}</div>
              <div class="stat-label">Ingresos del Sistema</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card deudas-card">
            <mat-card-content>
              <div class="stat-icon"><mat-icon>credit_card_off</mat-icon></div>
              <div class="stat-value">S/ {{ adminService.dashboard()?.totalDeudasPendientes ?? 0 | number:'1.2-2' }}</div>
              <div class="stat-label">Deudas Pendientes</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card metas-card">
            <mat-card-content>
              <div class="stat-icon"><mat-icon>savings</mat-icon></div>
              <div class="stat-value">{{ adminService.dashboard()?.totalMetasAhorro ?? 0 | number }}</div>
              <div class="stat-label">Metas de Ahorro</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick links -->
        <div class="admin-links">
          <h2>Acceso rápido</h2>
          <div class="link-cards">
            <a mat-raised-button color="primary" routerLink="/admin/articulos">
              <mat-icon>article</mat-icon> Administrar Artículos
            </a>
            <a mat-raised-button routerLink="/admin/usuarios">
              <mat-icon>manage_accounts</mat-icon> Administrar Usuarios
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 28px;
      font-weight: 500;
    }
    h2 {
      font-size: 20px;
      font-weight: 500;
      margin: 32px 0 16px 0;
    }
    .stat-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      border-radius: 8px;
      transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); }
    .usuarios-card { border-left: 4px solid #3f51b5; }
    .nuevos-card { border-left: 4px solid #9c27b0; }
    .transacciones-card { border-left: 4px solid #ff9800; }
    .gastos-card { border-left: 4px solid #f44336; }
    .ingresos-card { border-left: 4px solid #4caf50; }
    .deudas-card { border-left: 4px solid #e91e63; }
    .metas-card { border-left: 4px solid #00bcd4; }

    .stat-icon { margin-bottom: 8px; }
    .stat-icon mat-icon { font-size: 32px; width: 32px; height: 32px; color: #3f51b5; }
    .stat-value { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .stat-label { font-size: 14px; color: rgba(0,0,0,0.6); }

    .admin-links {
      margin-top: 16px;
    }
    .link-cards {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .link-cards a {
      padding: 12px 24px;
      gap: 8px;
    }

    .loading-container, .error-container, .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
    }
    .error-container mat-icon, .empty-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  protected adminService = inject(AdminService);

  ngOnInit(): void {
    this.adminService.loadAdminDashboard();
  }

  retry(): void {
    this.adminService.loadAdminDashboard();
  }
}
