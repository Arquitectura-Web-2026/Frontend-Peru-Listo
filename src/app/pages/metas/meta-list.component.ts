import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MetaAhorroService } from '../../services/meta-ahorro.service';
import { AuthService } from '../../services/auth.service';
import { MetaAhorroDTO } from '../../models/meta.models';
import { AportarDialogComponent } from '../../shared/dialogs/aportar-dialog.component';

@Component({
  selector: 'app-meta-list',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    DatePipe,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="meta-list-container">
      <h1>Metas de Ahorro</h1>

      @if (metaService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando metas...</p>
        </div>
      }

      @if (metaService.error() && !metaService.loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ metaService.error() }}</p>
          <button mat-raised-button color="primary" (click)="loadMetas()">Reintentar</button>
        </div>
      }

      @if (!metaService.loading() && !metaService.error() && metaService.metas().length === 0) {
        <div class="empty-container">
          <mat-icon>savings</mat-icon>
          <p>Sin metas de ahorro definidas</p>
        </div>
      }

      @if (!metaService.loading() && metaService.metas().length > 0) {
        <div class="meta-cards">
          @for (meta of metaService.metas(); track meta.id) {
            <mat-card class="meta-card">
              <mat-card-header>
                <mat-card-title>{{ meta.nombre }}</mat-card-title>
                <mat-card-subtitle>
                  <mat-chip [class.active]="meta.estado === 'en_progreso' || meta.estado === 'ACTIVA'" [class.completed]="meta.estado === 'completada' || meta.estado === 'COMPLETADA'">
                    {{ meta.estado === 'en_progreso' ? 'En progreso' : meta.estado === 'completada' ? 'Completada' : meta.estado }}
                  </mat-chip>
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <mat-progress-bar
                  mode="determinate"
                  [value]="getPorcentaje(meta)"
                  [color]="getPorcentaje(meta) >= 100 ? 'accent' : 'primary'">
                </mat-progress-bar>
                <div class="progress-details">
                  <span>S/ {{ meta.montoActual | number:'1.2-2' }}</span>
                  <span>de S/ {{ meta.montoObjetivo | number:'1.2-2' }}</span>
                </div>
                <p class="progress-percent">{{ getPorcentaje(meta) | number:'1.1-1' }}%</p>
                @if (meta.fechaLimite) {
                  <p class="deadline">Límite: {{ meta.fechaLimite | date:'dd/MM/yyyy' }}</p>
                }
              </mat-card-content>
              <mat-card-actions align="end">
                @if (meta.estado === 'en_progreso' || meta.estado === 'ACTIVA') {
                  <button mat-stroked-button color="primary" (click)="openAportarDialog(meta)">
                    <mat-icon>add</mat-icon> Aportar
                  </button>
                }
                <button mat-icon-button color="primary" (click)="router.navigate(['/metas', meta.id, 'editar'])">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteMeta(meta.id!)">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }

      <button mat-fab color="primary" class="fab" routerLink="/metas/nuevo">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .meta-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 28px;
      font-weight: 500;
    }
    .meta-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }
    .meta-card {
      border-radius: 8px;
    }
    .progress-details {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 14px;
      color: rgba(0,0,0,0.7);
    }
    .progress-percent {
      text-align: right;
      font-size: 14px;
      font-weight: 500;
      color: rgba(0,0,0,0.6);
    }
    .deadline {
      font-size: 12px;
      color: rgba(0,0,0,0.5);
      margin-top: 4px;
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
    .active {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
    .completed {
      background-color: #e3f2fd !important;
      color: #1565c0 !important;
    }
  `]
})
export class MetaListComponent implements OnInit {
  protected metaService = inject(MetaAhorroService);
  private authService = inject(AuthService);
  protected router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadMetas();
  }

  loadMetas(): void {
    const userId = this.authService.currentUserId();
    if (userId) {
      this.metaService.getMetas(userId);
    }
  }

  getPorcentaje(meta: MetaAhorroDTO): number {
    if (!meta.montoObjetivo || meta.montoObjetivo === 0) return 0;
    return Math.min((meta.montoActual / meta.montoObjetivo) * 100, 100);
  }

  openAportarDialog(meta: MetaAhorroDTO): void {
    const dialogRef = this.dialog.open(AportarDialogComponent, {
      width: '360px',
      data: { metaId: meta.id!, metaNombre: meta.nombre },
    });

    dialogRef.afterClosed().subscribe((monto: number | undefined) => {
      if (monto) {
        this.metaService.aportarMeta(meta.id!, monto).subscribe({
          next: () => {
            this.snackBar.open('Aporte registrado exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Error al realizar aporte', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }

  deleteMeta(id: number): void {
    if (confirm('¿Eliminar esta meta de ahorro?')) {
      this.metaService.deleteMeta(id).subscribe({
        next: () => {
          this.snackBar.open('Meta eliminada', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al eliminar meta', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
