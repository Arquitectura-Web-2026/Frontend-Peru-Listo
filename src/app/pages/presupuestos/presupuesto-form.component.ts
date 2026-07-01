import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { PresupuestoService } from '../../services/presupuesto.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

@Component({
  selector: 'app-presupuesto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Editar Presupuesto' : 'Crear Presupuesto' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="presupuestoForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Categoría</mat-label>
              <mat-select formControlName="categoriaId">
                @for (cat of categoriaService.categorias(); track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.nombre }}</mat-option>
                }
              </mat-select>
              @if (presupuestoForm.get('categoriaId')?.hasError('required') && presupuestoForm.get('categoriaId')?.touched) {
                <mat-error>La categoría es requerida</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mes</mat-label>
              <mat-select formControlName="mes">
                @for (m of meses; track m.value) {
                  <mat-option [value]="m.value">{{ m.label }}</mat-option>
                }
              </mat-select>
              @if (presupuestoForm.get('mes')?.hasError('required') && presupuestoForm.get('mes')?.touched) {
                <mat-error>El mes es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Año</mat-label>
              <input matInput type="number" formControlName="anio" placeholder="2026" />
              @if (presupuestoForm.get('anio')?.hasError('required') && presupuestoForm.get('anio')?.touched) {
                <mat-error>El año es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Monto Límite</mat-label>
              <input matInput type="number" formControlName="montoLimite" placeholder="0.00" min="0" step="0.01" />
              <span matTextPrefix>S/&nbsp;</span>
              @if (presupuestoForm.get('montoLimite')?.hasError('required') && presupuestoForm.get('montoLimite')?.touched) {
                <mat-error>El monto límite es requerido</mat-error>
              }
              @if (presupuestoForm.get('montoLimite')?.hasError('min') && presupuestoForm.get('montoLimite')?.touched) {
                <mat-error>El monto debe ser mayor o igual a 0</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="router.navigate(['/presupuestos'])">
                Cancelar
              </button>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="presupuestoForm.invalid || submitting()">
                @if (submitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ isEditMode ? 'Actualizar' : 'Crear' }}
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }
    .form-card {
      border-radius: 8px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 12px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }
    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class PresupuestoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private presupuestoService = inject(PresupuestoService);
  protected categoriaService = inject(CategoriaService);
  private authService = inject(AuthService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  submitting = signal(false);
  isEditMode = false;
  private editId: number | null = null;

  readonly meses = MESES;

  private readonly now = new Date();

  presupuestoForm: FormGroup = this.fb.group({
    categoriaId: [null, [Validators.required]],
    mes: [this.now.getMonth() + 1, [Validators.required]],
    anio: [this.now.getFullYear(), [Validators.required]],
    montoLimite: [null, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    const userId = this.authService.currentUserId();
    if (userId) {
      this.categoriaService.getCategorias(userId);
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.editId = Number(idParam);

      const presupuestoAEditar = this.presupuestoService.presupuestos().find(p => p.id === this.editId);
      if (presupuestoAEditar) {
        this.presupuestoForm.patchValue({
          categoriaId: presupuestoAEditar.categoriaId,
          mes: presupuestoAEditar.mes,
          anio: presupuestoAEditar.anio,
          montoLimite: presupuestoAEditar.montoLimite,
        });

        // Disable categoria, mes, anio — only monto can be changed in edit mode
        this.presupuestoForm.get('categoriaId')?.disable();
        this.presupuestoForm.get('mes')?.disable();
        this.presupuestoForm.get('anio')?.disable();
      }
    }
  }

  onSubmit(): void {
    // Use getRawValue to include disabled field values
    const rawValue = this.presupuestoForm.getRawValue();

    if (this.isEditMode) {
      // Edit mode only validates montoLimite since other fields are disabled
      if (!rawValue.montoLimite || rawValue.montoLimite < 0) return;
    } else {
      if (this.presupuestoForm.invalid) return;
    }

    this.submitting.set(true);
    const userId = this.authService.currentUserId();
    if (!userId) {
      this.snackBar.open('Error: usuario no autenticado', 'Cerrar', { duration: 5000 });
      this.submitting.set(false);
      return;
    }

    if (this.isEditMode && this.editId) {
      this.presupuestoService.updatePresupuesto(this.editId, Number(rawValue.montoLimite)).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Presupuesto actualizado', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/presupuestos']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al actualizar presupuesto', 'Cerrar', { duration: 5000 });
        }
      });
    } else {
      const dto = {
        categoriaId: Number(rawValue.categoriaId),
        mes: Number(rawValue.mes),
        anio: Number(rawValue.anio),
        montoLimite: Number(rawValue.montoLimite),
        usuarioId: userId,
      };

      this.presupuestoService.createPresupuesto(dto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Presupuesto creado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/presupuestos']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al crear presupuesto', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
