import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe, CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeudaService } from '../../services/deuda.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-deuda-list',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="deuda-list-container">
      <h1>Deudas</h1>

      @if (deudaService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando deudas...</p>
        </div>
      }

      @if (deudaService.error() && !deudaService.loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ deudaService.error() }}</p>
          <button mat-raised-button color="primary" (click)="loadDeudas()">Reintentar</button>
        </div>
      }

      @if (!deudaService.loading() && !deudaService.error() && deudaService.deudas().length === 0) {
        <div class="empty-container">
          <mat-icon>credit_card</mat-icon>
          <p>Sin deudas registradas</p>
        </div>
      }

      @if (!deudaService.loading() && deudaService.deudas().length > 0) {
        <table mat-table [dataSource]="deudaService.deudas()" class="mat-elevation-z2 full-width-table">
          <ng-container matColumnDef="acreedor">
            <th mat-header-cell *matHeaderCellDef>Acreedor</th>
            <td mat-cell *matCellDef="let row">{{ row.acreedor }}</td>
          </ng-container>
          <ng-container matColumnDef="monto">
            <th mat-header-cell *matHeaderCellDef>Monto</th>
            <td mat-cell *matCellDef="let row">S/ {{ row.monto | number:'1.2-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="fechaLimite">
            <th mat-header-cell *matHeaderCellDef>Fecha Límite</th>
            <td mat-cell *matCellDef="let row">{{ row.fechaLimite | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip [ngClass]="{
                'estado-pendiente': row.estado === 'PENDIENTE',
                'estado-pagada': row.estado === 'PAGADA',
                'estado-vencida': row.estado === 'VENCIDA'
              }">
                {{ row.estado }}
              </mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let row">
              @if (row.estado !== 'PAGADA') {
                <button mat-icon-button color="primary" (click)="marcarPagada(row.id!)" title="Marcar como pagada">
                  <mat-icon>check_circle</mat-icon>
                </button>
              }
              <button mat-icon-button color="warn" (click)="confirmDelete(row.id!)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      }
    </div>
  `,
  styles: [`
    .deuda-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 28px;
      font-weight: 500;
    }
    .full-width-table {
      width: 100%;
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
    .estado-pendiente {
      background-color: #fff3e0 !important;
      color: #e65100 !important;
    }
    .estado-pagada {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
    .estado-vencida {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }
  `]
})
export class DeudaListComponent implements OnInit {
  protected deudaService = inject(DeudaService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  readonly displayedColumns: string[] = ['acreedor', 'monto', 'fechaLimite', 'estado', 'acciones'];

  ngOnInit(): void {
    this.loadDeudas();
  }

  loadDeudas(): void {
    const userId = this.authService.currentUserId();
    if (userId) {
      this.deudaService.getDeudas(userId);
    }
  }

  marcarPagada(id: number): void {
    this.deudaService.marcarPagada(id).subscribe({
      next: () => {
        this.snackBar.open('Deuda marcada como pagada', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al marcar como pagada', 'Cerrar', { duration: 5000 });
      }
    });
  }

  confirmDelete(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta deuda?')) {
      this.deudaService.deleteDeuda(id).subscribe({
        next: () => {
          this.snackBar.open('Deuda eliminada', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al eliminar deuda', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
