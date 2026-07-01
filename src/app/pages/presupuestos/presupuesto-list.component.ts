import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { PresupuestoService } from '../../services/presupuesto.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { ResumenPresupuestoDTO } from '../../models/presupuesto.models';

const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

@Component({
  selector: 'app-presupuesto-list',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
  ],
  template: `
    <div class="presupuesto-list-container">
      <div class="header-row">
        <h1>Presupuestos</h1>
        <div class="month-selector">
          <button mat-icon-button (click)="prevMonth()"><mat-icon>chevron_left</mat-icon></button>
          <span class="month-label">{{ nombreMes() }} {{ anio() }}</span>
          <button mat-icon-button (click)="nextMonth()"><mat-icon>chevron_right</mat-icon></button>
        </div>
      </div>

      @if (presupuestoService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando presupuestos...</p>
        </div>
      }

      @if (presupuestoService.error() && !presupuestoService.loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ presupuestoService.error() }}</p>
          <button mat-raised-button color="primary" (click)="loadPresupuestos()">Reintentar</button>
        </div>
      }

      @if (!presupuestoService.loading() && !presupuestoService.error() && presupuestoService.presupuestos().length === 0) {
        <div class="empty-container">
          <mat-icon>pie_chart</mat-icon>
          <p>Sin presupuestos definidos</p>
        </div>
      }

      @if (!presupuestoService.loading() && presupuestoService.presupuestos().length > 0) {
        <div class="presupuesto-cards">
          @for (presupuesto of presupuestoService.presupuestos(); track presupuesto.id) {
            <mat-card class="presupuesto-card">
              <mat-card-header>
                <mat-card-title>{{ getCategoriaNombre(presupuesto.categoriaId) }}</mat-card-title>
                <mat-card-subtitle>Límite: S/ {{ presupuesto.montoLimite | number:'1.2-2' }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <mat-progress-bar
                  mode="determinate"
                  [value]="getPorcentaje(presupuesto)"
                  [color]="getPorcentaje(presupuesto) > 80 ? 'warn' : 'primary'">
                </mat-progress-bar>
                @if (getResumen(presupuesto); as resumen) {
                  <p class="progress-text">
                    S/ {{ resumen.montoGastado | number:'1.2-2' }} gastado de S/ {{ presupuesto.montoLimite | number:'1.2-2' }}
                    — {{ resumen.porcentajeUso | number:'1.1-1' }}%
                  </p>
                } @else {
                  <p class="progress-text">Sin gastos registrados — 0%</p>
                }
              </mat-card-content>
              <mat-card-actions align="end">
                <button mat-icon-button color="primary" (click)="router.navigate(['/presupuestos', presupuesto.id, 'editar'])">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deletePresupuesto(presupuesto.id!)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }

      <button mat-fab color="primary" class="fab" routerLink="/presupuestos/nuevo">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .presupuesto-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .header-row h1 {
      margin-bottom: 0;
      font-size: 28px;
      font-weight: 500;
    }
    .month-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f5f5f5;
      border-radius: 24px;
      padding: 4px 12px;
    }
    .month-label {
      font-size: 16px;
      font-weight: 500;
      min-width: 140px;
      text-align: center;
    }
    .presupuesto-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }
    .presupuesto-card {
      border-radius: 8px;
    }
    .progress-text {
      margin-top: 8px;
      font-size: 14px;
      color: rgba(0,0,0,0.6);
      text-align: right;
    }
    .loading-container, .error-container, .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
    }
    .empty-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: rgba(0,0,0,0.3);
    }
    .fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 100;
    }
  `]
})
export class PresupuestoListComponent implements OnInit {
  protected presupuestoService = inject(PresupuestoService);
  protected categoriaService = inject(CategoriaService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  protected router = inject(Router);

  private readonly now = new Date();
  readonly mes = signal<number>(this.now.getMonth() + 1);
  readonly anio = signal<number>(this.now.getFullYear());
  readonly nombreMes = () => MESES_NOMBRES[this.mes() - 1];

  /** Resumen de presupuestos con porcentaje real desde el backend */
  readonly resumenes = signal<ResumenPresupuestoDTO[]>([]);

  ngOnInit(): void {
    this.loadPresupuestos();
  }

  prevMonth(): void {
    if (this.mes() === 1) {
      this.mes.set(12);
      this.anio.update(a => a - 1);
    } else {
      this.mes.update(m => m - 1);
    }
    this.loadPresupuestos();
  }

  nextMonth(): void {
    if (this.mes() === 12) {
      this.mes.set(1);
      this.anio.update(a => a + 1);
    } else {
      this.mes.update(m => m + 1);
    }
    this.loadPresupuestos();
  }

  loadPresupuestos(): void {
    const userId = this.authService.currentUserId();
    if (userId) {
      this.presupuestoService.getPresupuestos(userId, this.mes(), this.anio());
      this.categoriaService.getCategorias(userId);
      this.loadResumen(userId);
    }
  }

  private loadResumen(userId: number): void {
    const params = new HttpParams()
      .set('usuarioId', String(userId))
      .set('mes', String(this.mes()))
      .set('anio', String(this.anio()));
    this.http.get<ResumenPresupuestoDTO[]>('/API/dashboard/resumen_presupuestos', { params })
      .subscribe(data => this.resumenes.set(data));
  }

  getResumen(presupuesto: any): ResumenPresupuestoDTO | undefined {
    const nombreCat = this.getCategoriaNombre(presupuesto.categoriaId);
    return this.resumenes().find(r => r.categoria === nombreCat);
  }

  getCategoriaNombre(categoriaId: number): string {
    const cat = this.categoriaService.categorias().find(c => c.id === categoriaId);
    return cat ? cat.nombre : `Cat #${categoriaId}`;
  }

  getPorcentaje(presupuesto: any): number {
    const resumen = this.getResumen(presupuesto);
    return resumen ? Math.min(resumen.porcentajeUso, 100) : 0;
  }

  deletePresupuesto(id: number): void {
    if (confirm('¿Eliminar este presupuesto?')) {
      this.presupuestoService.deletePresupuesto(id).subscribe();
    }
  }
}
