import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../services/admin.service';
import { AdminUsuarioDetalleDTO } from '../../../models/admin.models';

@Component({
  selector: 'app-admin-usuario-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="usuario-detail-container">
      <a mat-button routerLink="/admin/usuarios" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Volver a usuarios
      </a>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando detalles del usuario...</p>
        </div>
      }

      @if (error() && !loading()) {
        <div class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ error() }}</p>
          <button mat-raised-button color="primary" [routerLink]="['/admin/usuarios']">Volver a usuarios</button>
        </div>
      }

      @if (!loading() && !error() && usuario()) {
        <mat-card class="detail-card">
          <mat-card-header>
            <mat-card-title>{{ usuario()?.nombreCompleto }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip [color]="usuario()?.role === 'ROLE_ADMIN' ? 'accent' : ''">
                {{ usuario()?.role }}
              </mat-chip>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Correo</span>
                <span class="detail-value">{{ usuario()?.correo }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fecha de Registro</span>
                <span class="detail-value">{{ usuario()?.fechaRegistro | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Gastos</span>
                <span class="detail-value">S/ {{ usuario()?.totalGastos | number:'1.2-2' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Ingresos</span>
                <span class="detail-value">S/ {{ usuario()?.totalIngresos | number:'1.2-2' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Total Deudas</span>
                <span class="detail-value">S/ {{ usuario()?.totalDeudas | number:'1.2-2' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Metas de Ahorro</span>
                <span class="detail-value">{{ usuario()?.totalMetas }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Presupuestos</span>
                <span class="detail-value">{{ usuario()?.totalPresupuestos }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .usuario-detail-container {
      padding: 24px;
      max-width: 700px;
      margin: 0 auto;
    }
    .back-btn {
      margin-bottom: 16px;
    }
    .detail-card {
      border-radius: 8px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 16px 0;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-label {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-value {
      font-size: 16px;
      font-weight: 500;
    }
    mat-card-subtitle {
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
export class AdminUsuarioDetailComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);

  readonly usuario = signal<AdminUsuarioDetalleDTO | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error.set('Usuario no encontrado');
      return;
    }

    this.loading.set(true);
    this.adminService.getUsuarioDetalle(Number(idParam)).subscribe({
      next: (data) => {
        this.usuario.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar detalles del usuario');
        this.loading.set(false);
      }
    });
  }
}
