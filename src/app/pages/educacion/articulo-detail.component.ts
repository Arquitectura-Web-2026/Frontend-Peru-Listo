import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ArticuloService } from '../../services/articulo.service';
import { ArticuloEducacionDTO } from '../../models/articulo.models';

@Component({
  selector: 'app-articulo-detail',
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
    <div class="articulo-detail-container">
      <!-- Back button -->
      <a mat-button routerLink="/educacion" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Volver a artículos
      </a>

      <!-- Loading state -->
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando artículo...</p>
        </div>
      }

      <!-- Error state -->
      @if (error() && !loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ error() }}</p>
          <button mat-raised-button color="primary" [routerLink]="['/educacion']">Volver a artículos</button>
        </div>
      }

      <!-- Article content -->
      @if (!loading() && !error() && articulo()) {
        <mat-card class="articulo-card">
          <mat-card-header>
            <mat-card-title>{{ articulo()?.titulo }}</mat-card-title>
            <mat-card-subtitle>
              {{ articulo()?.fechaPublicacion | date:'dd/MM/yyyy' }}
              <mat-chip>{{ articulo()?.categoriaTematica }}</mat-chip>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="cuerpo" [innerHTML]="formatearCuerpo(articulo()?.cuerpo || '')"></div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .articulo-detail-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    .back-btn {
      margin-bottom: 16px;
    }
    .articulo-card {
      border-radius: 8px;
    }
    .cuerpo {
      line-height: 1.8;
      font-size: 16px;
      padding: 16px 0;
    }
    .cuerpo ::ng-deep p {
      margin-bottom: 16px;
    }
    mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }
    .loading-container, .error-container {
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
  `]
})
export class ArticuloDetailComponent implements OnInit {
  private articuloService = inject(ArticuloService);
  private route = inject(ActivatedRoute);

  readonly articulo = signal<ArticuloEducacionDTO | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error.set('Artículo no encontrado');
      return;
    }

    this.loading.set(true);
    this.articuloService.getArticulo(Number(idParam)).subscribe({
      next: (data) => {
        this.articulo.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar el artículo');
        this.loading.set(false);
      }
    });
  }

  /** Convierte texto a HTML: si ya tiene tags HTML lo deja pasar, si es texto plano lo formatea en párrafos. */
  formatearCuerpo(texto: string): string {
    if (!texto) return '';
    // Si ya contiene HTML, devolver tal cual
    if (/<[a-z][\s\S]*>/i.test(texto)) return texto;
    // Texto plano → párrafos por doble salto de línea
    return texto
      .split(/\n\s*\n/)
      .map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
      .join('');
  }
}
