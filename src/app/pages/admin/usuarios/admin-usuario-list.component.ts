import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-usuario-list',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <div class="admin-usuario-list-container">
      <h1>Administrar Usuarios</h1>

      @if (adminService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando usuarios...</p>
        </div>
      }

      @if (adminService.error() && !adminService.loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ adminService.error() }}</p>
          <button mat-raised-button color="primary" (click)="loadUsuarios()">Reintentar</button>
        </div>
      }

      @if (!adminService.loading() && !adminService.error() && adminService.usuarios().length === 0) {
        <div class="empty-container">
          <mat-icon>people</mat-icon>
          <p>Sin usuarios registrados</p>
        </div>
      }

      @if (!adminService.loading() && adminService.usuarios().length > 0) {
        <table mat-table [dataSource]="adminService.usuarios()" class="mat-elevation-z2 full-width-table">

          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let row">{{ row.nombreCompleto }}</td>
          </ng-container>

          <ng-container matColumnDef="correo">
            <th mat-header-cell *matHeaderCellDef>Correo</th>
            <td mat-cell *matCellDef="let row">{{ row.correo }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Rol</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip [color]="row.role === 'ROLE_ADMIN' ? 'accent' : ''">
                {{ row.role }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="fechaRegistro">
            <th mat-header-cell *matHeaderCellDef>Fecha Registro</th>
            <td mat-cell *matCellDef="let row">{{ row.fechaRegistro | date:'dd/MM/yyyy' }}</td>
          </ng-container>

          <ng-container matColumnDef="gastos">
            <th mat-header-cell *matHeaderCellDef>Gastos</th>
            <td mat-cell *matCellDef="let row">S/ {{ row.totalGastos | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="ingresos">
            <th mat-header-cell *matHeaderCellDef>Ingresos</th>
            <td mat-cell *matCellDef="let row">S/ {{ row.totalIngresos | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" (click)="verDetalle(row.id)">
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="verDetalle(row.id)" class="clickable-row"></tr>
        </table>
      }
    </div>
  `,
  styles: [`
    .admin-usuario-list-container {
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
      border-radius: 8px;
      overflow: hidden;
    }
    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background-color: rgba(0,0,0,0.04);
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
export class AdminUsuarioListComponent implements OnInit {
  protected adminService = inject(AdminService);
  private router = inject(Router);

  readonly displayedColumns: string[] = ['nombre', 'correo', 'role', 'fechaRegistro', 'gastos', 'ingresos', 'acciones'];

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.adminService.getUsuarios().subscribe();
  }

  verDetalle(id: number): void {
    this.router.navigate(['/admin/usuarios', id]);
  }
}
