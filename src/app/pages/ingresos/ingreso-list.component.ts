import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IngresoService } from '../../services/ingreso.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ingreso-list',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    DatePipe,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="ingreso-list-container">
      <h1>Ingresos</h1>

      @if (ingresoService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando ingresos...</p>
        </div>
      }

      @if (ingresoService.error() && !ingresoService.loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ ingresoService.error() }}</p>
          <button mat-raised-button color="primary" (click)="loadIngresos()">Reintentar</button>
        </div>
      }

      @if (!ingresoService.loading() && !ingresoService.error() && ingresoService.ingresos().length === 0) {
        <div class="empty-container">
          <mat-icon>attach_money</mat-icon>
          <p>Sin ingresos registrados</p>
        </div>
      }

      @if (!ingresoService.loading() && ingresoService.ingresos().length > 0) {
        <table mat-table [dataSource]="ingresoService.ingresos()" class="mat-elevation-z2 full-width-table">
          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let row">{{ row.fecha | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="descripcion">
            <th mat-header-cell *matHeaderCellDef>Descripción</th>
            <td mat-cell *matCellDef="let row">{{ row.descripcion }}</td>
          </ng-container>
          <ng-container matColumnDef="monto">
            <th mat-header-cell *matHeaderCellDef>Monto</th>
            <td mat-cell *matCellDef="let row">S/ {{ row.monto | number:'1.2-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" [routerLink]="['/ingresos', row.id, 'editar']">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="confirmDelete(row.id!)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      }

      <button mat-fab color="primary" class="fab" routerLink="/ingresos/nuevo">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .ingreso-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 28px;
      font-weight: 500;
    }
    .full-width-table {
      width: 100%;
    }
    .fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 100;
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
    .empty-container mat-icon {
      color: rgba(0,0,0,0.3);
    }
  `]
})
export class IngresoListComponent implements OnInit {
  protected ingresoService = inject(IngresoService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  readonly displayedColumns: string[] = ['fecha', 'descripcion', 'monto', 'acciones'];

  ngOnInit(): void {
    this.loadIngresos();
  }

  loadIngresos(): void {
    const userId = this.authService.currentUserId();
    if (userId) {
      this.ingresoService.getIngresos(userId);
    }
  }

  confirmDelete(id: number): void {
    if (confirm('¿Estás seguro de eliminar este ingreso?')) {
      this.ingresoService.deleteIngreso(id).subscribe({
        next: () => {
          this.snackBar.open('Ingreso eliminado', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al eliminar ingreso', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
