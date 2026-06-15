import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { PresupuestoService } from '../../services/presupuesto.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { CategoriaDTO } from '../../models/gasto.models';

@Component({
  selector: 'app-presupuesto-list',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
  ],
  template: `
    <div class="presupuesto-list-container">
      <h1>Presupuestos</h1>

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
                <p class="progress-text">{{ getPorcentaje(presupuesto) | number:'1.1-1' }}% utilizado</p>
              </mat-card-content>
              <mat-card-actions align="end">
                <button mat-icon-button color="warn" (click)="deletePresupuesto(presupuesto.id!)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .presupuesto-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 28px;
      font-weight: 500;
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
  `]
})
export class PresupuestoListComponent implements OnInit {
  protected presupuestoService = inject(PresupuestoService);
  protected categoriaService = inject(CategoriaService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadPresupuestos();
  }

  loadPresupuestos(): void {
    const userId = this.authService.currentUserId();
    if (userId) {
      const now = new Date();
      this.presupuestoService.getPresupuestos(userId, now.getMonth() + 1, now.getFullYear());
      this.categoriaService.getCategorias(userId);
    }
  }

  getCategoriaNombre(categoriaId: number): string {
    const cat = this.categoriaService.categorias().find(c => c.id === categoriaId);
    return cat ? cat.nombre : `Cat #${categoriaId}`;
  }

  getPorcentaje(presupuesto: any): number {
    // For now, use a default 0% — will be replaced with ResumenPresupuestoDTO data in Phase 2
    return 0;
  }

  deletePresupuesto(id: number): void {
    if (confirm('¿Eliminar este presupuesto?')) {
      this.presupuestoService.deletePresupuesto(id).subscribe();
    }
  }
}
