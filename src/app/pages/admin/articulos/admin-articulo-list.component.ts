import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ArticuloService } from '../../../services/articulo.service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-articulo-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="admin-articulo-list-container">
      <h1>Administrar Artículos</h1>

      @if (articuloService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando artículos...</p>
        </div>
      }

      @if (articuloService.error() && !articuloService.loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ articuloService.error() }}</p>
          <button mat-raised-button color="primary" (click)="loadArticulos()">Reintentar</button>
        </div>
      }

      @if (!articuloService.loading() && !articuloService.error() && articuloService.articulos().length === 0) {
        <div class="empty-container">
          <mat-icon>article</mat-icon>
          <p>Sin artículos registrados</p>
        </div>
      }

      @if (!articuloService.loading() && articuloService.articulos().length > 0) {
        <table mat-table [dataSource]="articuloService.articulos()" class="mat-elevation-z2 full-width-table">

          <ng-container matColumnDef="titulo">
            <th mat-header-cell *matHeaderCellDef>Título</th>
            <td mat-cell *matCellDef="let row">{{ row.titulo }}</td>
          </ng-container>

          <ng-container matColumnDef="categoria">
            <th mat-header-cell *matHeaderCellDef>Categoría</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip>{{ row.categoriaTematica }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let row">{{ row.fechaPublicacion | date:'dd/MM/yyyy' }}</td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" [routerLink]="['/admin/articulos', row.id, 'editar']">
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

      <button mat-fab color="primary" class="fab" routerLink="/admin/articulos/nuevo">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .admin-articulo-list-container {
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
      border-radius: 8px;
      overflow: hidden;
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
export class AdminArticuloListComponent implements OnInit {
  protected articuloService = inject(ArticuloService);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  readonly displayedColumns: string[] = ['titulo', 'categoria', 'fecha', 'acciones'];

  ngOnInit(): void {
    this.loadArticulos();
  }

  loadArticulos(): void {
    this.articuloService.getArticulos().subscribe();
  }

  confirmDelete(id: number): void {
    if (confirm('¿Estás seguro de eliminar este artículo?')) {
      this.deleteArticulo(id);
    }
  }

  deleteArticulo(id: number): void {
    this.adminService.deleteArticulo(id).subscribe({
      next: () => {
        this.snackBar.open('Artículo eliminado', 'Cerrar', { duration: 3000 });
        this.loadArticulos();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al eliminar artículo', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
