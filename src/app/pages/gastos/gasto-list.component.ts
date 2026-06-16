import { Component, inject, OnInit, ViewChild, effect } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { GastoService } from '../../services/gasto.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { MatSortModule, MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-gasto-list',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule, // Módulo de ordenamiento activo
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  template: `
    <div class="gasto-list-container">
      <h1>Gastos</h1>

      @if (gastoService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando gastos...</p>
        </div>
      }

      @if (gastoService.error() && !gastoService.loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ gastoService.error() }}</p>
          <button mat-raised-button color="primary" (click)="loadGastos()">Reintentar</button>
        </div>
      }

      @if (!gastoService.loading() && !gastoService.error() && gastoService.gastos().length === 0) {
        <div class="empty-container">
          <mat-icon>receipt</mat-icon>
          <p>Sin gastos registrados</p>
        </div>
      }

      @if (!gastoService.loading() && gastoService.gastos().length > 0) {
        <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z2 full-width-table">

          <ng-container matColumnDef="fecha">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha</th>
            <td mat-cell *matCellDef="let row">{{ row.fechagasto | date:'dd/MM/yyyy' }}</td>
          </ng-container>

          <ng-container matColumnDef="categoria">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Categoría</th>
            <td mat-cell *matCellDef="let row">{{ obtenerNombreCategoria(row) }}</td>
          </ng-container>

          <ng-container matColumnDef="descripcion">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Descripción</th>
            <td mat-cell *matCellDef="let row">{{ row.descripcion }}</td>
          </ng-container>

          <ng-container matColumnDef="monto">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Monto</th>
            <td mat-cell *matCellDef="let row">S/ {{ row.monto | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" [routerLink]="['/gastos', row.id, 'editar']">
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

      <button mat-fab color="primary" class="fab" routerLink="/gastos/nuevo">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .gasto-list-container {
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
    /* Estilizado para alinear correctamente los contenedores de las flechas de Material */
    ::v-deep .mat-sort-header-container {
      display: inline-flex;
      align-items: center;
    }
  `]
})
export class GastoListComponent implements OnInit {
  protected gastoService = inject(GastoService);
  protected categoriaService = inject(CategoriaService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  readonly displayedColumns: string[] = ['fecha', 'categoria', 'descripcion', 'monto', 'acciones'];

  // Fuente de datos necesaria para el filtrado/ordenación interactivo
  dataSource = new MatTableDataSource<any>([]);

  // Captura el motor matSort inyectado en el HTML
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (sort) {
      this.dataSource.sort = sort;
      this.setupCustomSorting();
    }
  }

  constructor() {
    // Escucha de manera reactiva el Signal de gastos e inyecta los datos al dataSource
    effect(() => {
      const listaGastos = this.gastoService.gastos();
      this.dataSource.data = listaGastos;
    });
  }

  ngOnInit(): void {
    this.loadGastos();
  }

  loadGastos(): void {
    const userId = this.authService.currentUserId();
    if (userId) {
      this.gastoService.getGastos(userId);
      this.categoriaService.getCategorias(userId);
    }
  }

  obtenerNombreCategoria(row: any): string {
    if (!row) return '—';
    const categoriaId = row.categoriaId || row.categoria?.id;
    if (!categoriaId) return '—';

    const lista = this.categoriaService.categorias();
    const encontrada = lista.find(c => c.id === categoriaId);
    return encontrada ? encontrada.nombre : '—';
  }

  /**
   * Modifica el comportamiento interno de MatSort para que ordene correctamente
   * por valores transformados (Cadenas dinámicas o Fechas ISO/Objetos).
   */
  private setupCustomSorting(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'fecha':
          // Convierte la propiedad 'fechagasto' a tiempo numérico para una cronología exacta
          return item.fechagasto ? new Date(item.fechagasto).getTime() : 0;
        case 'categoria':
          // Ordena alfabéticamente según el nombre de la categoría resuelto por tu método
          return this.obtenerNombreCategoria(item).toLowerCase();
        case 'monto':
          return item.monto ?? 0;
        default:
          return item[property]?.toString().toLowerCase() ?? '';
      }
    };
  }

  confirmDelete(id: number): void {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      this.deleteGasto(id);
    }
  }

  deleteGasto(id: number): void {
    this.gastoService.deleteGasto(id).subscribe({
      next: () => {
        this.snackBar.open('Gasto eliminado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al eliminar gasto', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
