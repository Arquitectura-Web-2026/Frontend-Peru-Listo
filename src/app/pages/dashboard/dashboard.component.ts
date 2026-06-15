import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { DashboardResumenDTO, GastosCategoriaDTO, ComparativaMensualDTO } from '../../models/dashboard.models';

/** Column definition for the comparison table. */
interface ComparativaColumn {
  key: string;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    MatCardModule,
    MatTableModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <!-- Loading state -->
      @if (dashService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando datos del dashboard...</p>
        </div>
      }

      <!-- Error state -->
      @if (dashService.error() && !dashService.loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ dashService.error() }}</p>
          <button mat-raised-button color="primary" (click)="retry()">Reintentar</button>
        </div>
      }

      <!-- Empty state -->
      @if (!dashService.loading() && !dashService.error() && !dashService.resumen()) {
        <div class="empty-container">
          <mat-icon>inbox</mat-icon>
          <p>Sin datos disponibles para este período</p>
        </div>
      }

      <!-- Data loaded -->
      @if (!dashService.loading() && dashService.resumen()) {
        <!-- Stat cards row -->
        <div class="stat-cards">
          <mat-card class="stat-card ingresos-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="stat-value">
                {{ dashService.resumen()?.totalIngresos ?? 0 | number:'1.2-2' }}
              </div>
              <div class="stat-label">Ingresos</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card gastos-card">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>trending_down</mat-icon>
              </div>
              <div class="stat-value">
                {{ dashService.resumen()?.totalGastos ?? 0 | number:'1.2-2' }}
              </div>
              <div class="stat-label">Gastos</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card balance-card" [class.positive]="(dashService.resumen()?.balance ?? 0) >= 0" [class.negative]="(dashService.resumen()?.balance ?? 0) < 0">
            <mat-card-content>
              <div class="stat-icon">
                <mat-icon>account_balance_wallet</mat-icon>
              </div>
              <div class="stat-value">
                {{ dashService.resumen()?.balance ?? 0 | number:'1.2-2' }}
              </div>
              <div class="stat-label">Balance</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Gastos por Categoría section -->
        <div class="section">
          <h2>Gastos por Categoría</h2>
          @if (dashService.gastosPorCategoria().length === 0) {
            <p class="no-data">Sin datos de categorías</p>
          } @else {
            <mat-list>
              @for (cat of dashService.gastosPorCategoria(); track cat.categoriaNombre) {
                <mat-list-item>
                  <span matListItemTitle>{{ cat.categoriaNombre }}</span>
                  <span matListItemLine>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="cat.porcentaje"
                      [color]="cat.porcentaje > 80 ? 'warn' : 'primary'">
                    </mat-progress-bar>
                  </span>
                  <span matListItemMeta>{{ cat.monto | number:'1.2-2' }} ({{ cat.porcentaje | number:'1.1-1' }}%)</span>
                </mat-list-item>
              }
            </mat-list>
          }
        </div>

        <!-- Comparativa Mensual section -->
        <div class="section">
          <h2>Comparativa Mensual</h2>
          @if (dashService.comparativaMensual().length === 0) {
            <p class="no-data">Sin datos comparativos</p>
          } @else {
            <table mat-table [dataSource]="dashService.comparativaMensual()" class="mat-elevation-z2 full-width-table">
              <ng-container matColumnDef="periodo">
                <th mat-header-cell *matHeaderCellDef>Período</th>
                <td mat-cell *matCellDef="let row">{{ row.mes }}/{{ row.anio }}</td>
              </ng-container>
              <ng-container matColumnDef="ingresos">
                <th mat-header-cell *matHeaderCellDef>Ingresos</th>
                <td mat-cell *matCellDef="let row">{{ row.ingresos | number:'1.2-2' }}</td>
              </ng-container>
              <ng-container matColumnDef="gastos">
                <th mat-header-cell *matHeaderCellDef>Gastos</th>
                <td mat-cell *matCellDef="let row">{{ row.gastos | number:'1.2-2' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="comparativaColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: comparativaColumns;"></tr>
            </table>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
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
      margin: 24px 0 12px 0;
    }

    .stat-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      border-radius: 8px;
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
    }
    .ingresos-card {
      border-left: 4px solid #4caf50;
    }
    .gastos-card {
      border-left: 4px solid #f44336;
    }
    .balance-card {
      border-left: 4px solid #2196f3;
    }
    .balance-card.positive {
      border-left: 4px solid #4caf50;
    }
    .balance-card.negative {
      border-left: 4px solid #f44336;
    }
    .stat-icon {
      margin-bottom: 8px;
    }
    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .ingresos-card .stat-icon mat-icon { color: #4caf50; }
    .gastos-card .stat-icon mat-icon { color: #f44336; }
    .balance-card .stat-icon mat-icon { color: #2196f3; }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 14px;
      color: rgba(0,0,0,0.6);
    }

    .section {
      margin-bottom: 32px;
    }
    .full-width-table {
      width: 100%;
    }
    .no-data {
      color: rgba(0,0,0,0.5);
      font-style: italic;
    }
    .error-container, .loading-container, .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
    }
    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    .empty-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: rgba(0,0,0,0.3);
    }
  `]
})
export class DashboardComponent implements OnInit {
  protected dashService = inject(DashboardService);
  private authService = inject(AuthService);

  readonly comparativaColumns: string[] = ['periodo', 'ingresos', 'gastos'];

  ngOnInit(): void {
    this.loadData();
  }

  /** Load dashboard data for the current month. */
  private loadData(): void {
    const userId = this.authService.currentUserId();
    if (!userId) return;

    const now = new Date();
    const mes = now.getMonth() + 1; // 1-based
    const anio = now.getFullYear();

    this.dashService.loading.set(true);
    this.dashService.error.set(null);

    // Parallel fetch: resumen, gastos por categoria, comparativa
    this.dashService.getResumenMensual(userId, mes, anio).subscribe({
      error: (err) => {
        this.dashService.error.set(err.error?.message || 'Error al cargar el resumen mensual');
        this.dashService.loading.set(false);
      }
    });

    this.dashService.getGastosPorCategoria(userId, mes, anio).subscribe({
      error: () => {
        if (!this.dashService.error()) {
          this.dashService.error.set('Error al cargar gastos por categoría');
        }
      }
    });

    this.dashService.getComparativaMensual(userId).subscribe({
      next: () => {
        if (this.dashService.resumen()) {
          this.dashService.loading.set(false);
        }
      },
      error: () => {
        if (!this.dashService.error()) {
          this.dashService.error.set('Error al cargar comparativa mensual');
        }
      }
    });
  }

  /** Retry loading after an error. */
  retry(): void {
    this.loadData();
  }
}
