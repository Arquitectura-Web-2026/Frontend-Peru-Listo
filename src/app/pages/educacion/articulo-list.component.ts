import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ArticuloService } from '../../services/articulo.service';

@Component({
  selector: 'app-articulo-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="articulo-list-container">
      <h1>Educación Financiera</h1>

      <!-- Category filter chips -->
      <div class="category-filters">
        @for (cat of categorias; track cat) {
          <button
            mat-stroked-button
            [color]="categoriaSeleccionada === cat ? 'primary' : ''"
            (click)="filtrarPorCategoria(cat)">
            {{ cat === 'Todas' ? 'Todos' : cat }}
          </button>
        }
      </div>

      <!-- Loading state -->
      @if (articuloService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando artículos...</p>
        </div>
      }

      <!-- Error state -->
      @if (articuloService.error() && !articuloService.loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ articuloService.error() }}</p>
          <button mat-raised-button color="primary" (click)="cargarArticulos()">Reintentar</button>
        </div>
      }

      <!-- Empty state -->
      @if (!articuloService.loading() && !articuloService.error() && articuloService.articulos().length === 0) {
        <div class="empty-container">
          <mat-icon>school</mat-icon>
          <p>Sin artículos disponibles</p>
        </div>
      }

      <!-- Articles grid -->
      @if (!articuloService.loading() && articuloService.articulos().length > 0) {
        <div class="articulos-grid">
          @for (articulo of articuloService.articulos(); track articulo.id) {
            <mat-card class="articulo-card" (click)="verArticulo(articulo.id!)" role="button" tabindex="0">
              <mat-card-header>
                <mat-card-title>{{ articulo.titulo }}</mat-card-title>
                <mat-card-subtitle>
                  {{ articulo.fechaPublicacion | date:'dd/MM/yyyy' }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p class="descripcion-corta">{{ articulo.descripcionCorta }}</p>
                <mat-chip-set>
                  <mat-chip>{{ articulo.categoriaTematica }}</mat-chip>
                </mat-chip-set>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .articulo-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 28px;
      font-weight: 500;
    }
    .category-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 24px;
    }
    .articulos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .articulo-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 8px;
    }
    .articulo-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .descripcion-corta {
      color: rgba(0,0,0,0.6);
      margin: 8px 0 12px 0;
      line-height: 1.5;
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
export class ArticuloListComponent implements OnInit {
  protected articuloService = inject(ArticuloService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly categorias = ['Todas', 'Ahorro', 'Inversión', 'Deudas', 'Presupuesto', 'Impuestos'];
  categoriaSeleccionada = 'Todas';

  ngOnInit(): void {
    const catParam = this.route.snapshot.paramMap.get('categoria');
    if (catParam) {
      this.categoriaSeleccionada = catParam;
      this.articuloService.filtrarPorCategoria(catParam).subscribe();
    } else {
      this.cargarArticulos();
    }
  }

  cargarArticulos(): void {
    this.categoriaSeleccionada = 'Todas';
    this.articuloService.getArticulos().subscribe();
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    if (categoria === 'Todas') {
      this.router.navigate(['/educacion']);
      this.articuloService.getArticulos().subscribe();
    } else {
      this.router.navigate(['/educacion', 'categoria', categoria]);
      this.articuloService.filtrarPorCategoria(categoria).subscribe();
    }
  }

  verArticulo(id: number): void {
    this.router.navigate(['/educacion', id]);
  }
}
