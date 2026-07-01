import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { CategoriaFormDialogComponent } from '../../shared/dialogs/categoria-form-dialog.component';
import { CategoriaDTO } from '../../models/gasto.models';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  template: `
    <div class="categoria-list-container">
      <h1>Categorías</h1>

      @if (categoriaService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando categorías...</p>
        </div>
      }

      @if (categoriaService.error() && !categoriaService.loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ categoriaService.error() }}</p>
          <button mat-raised-button color="primary" (click)="loadCategorias()">Reintentar</button>
        </div>
      }

      @if (!categoriaService.loading() && !categoriaService.error() && categoriaService.categorias().length === 0) {
        <div class="empty-container">
          <mat-icon>category</mat-icon>
          <p>Sin categorías registradas</p>
        </div>
      }

      @if (!categoriaService.loading() && categoriaService.categorias().length > 0) {
        <table mat-table [dataSource]="categoriaService.categorias()" class="mat-elevation-z2 full-width-table">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let row">{{ row.nombre }}</td>
          </ng-container>

          <ng-container matColumnDef="tipo">
            <th mat-header-cell *matHeaderCellDef>Tipo</th>
            <td mat-cell *matCellDef="let row">{{ row.tipo }}</td>
          </ng-container>

          <ng-container matColumnDef="color">
            <th mat-header-cell *matHeaderCellDef>Color</th>
            <td mat-cell *matCellDef="let row">
              <div class="color-swatch"
                   [style.background-color]="row.colorHex"
                   [style.width.px]="24"
                   [style.height.px]="24"
                   [style.border-radius.px]="4">
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let row">
              @if (!row.esPredeterminada) {
                <button mat-icon-button color="warn"
                        data-testid="delete-btn"
                        (click)="confirmDelete(row.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      }

      <button mat-fab color="primary" class="fab" (click)="openAddDialog()">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .categoria-list-container {
      padding: 24px;
      max-width: 1000px;
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
    .color-swatch {
      border: 1px solid rgba(0,0,0,0.12);
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
export class CategoriaListComponent implements OnInit {
  protected categoriaService = inject(CategoriaService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly displayedColumns: string[] = ['nombre', 'tipo', 'color', 'acciones'];

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    const userId = this.authService.currentUserId();
    if (userId) {
      this.categoriaService.getCategorias(userId);
    }
  }

  openAddDialog(): void {
    const userId = this.authService.currentUserId();
    if (!userId) return;

    const dialogRef = this.dialog.open(CategoriaFormDialogComponent, {
      width: '400px',
      data: { usuarioId: userId },
    });

    dialogRef.afterClosed().subscribe((result: CategoriaDTO | null) => {
      if (result) {
        this.snackBar.open('Categoría creada exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  confirmDelete(id: number): void {
    if (confirm('¿Eliminar esta categoría?')) {
      this.deleteCategory(id);
    }
  }

  deleteCategory(id: number): void {
    const userId = this.authService.currentUserId();
    if (!userId) return;

    this.categoriaService.deleteCategoria(id, userId).subscribe({
      next: () => {
        this.snackBar.open('Categoría eliminada', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al eliminar categoría', 'Cerrar', { duration: 5000 });
      },
    });
  }
}
