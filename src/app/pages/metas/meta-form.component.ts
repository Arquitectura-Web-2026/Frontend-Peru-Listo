import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MetaAhorroService } from '../../services/meta-ahorro.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-meta-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Editar Meta de Ahorro' : 'Crear Meta de Ahorro' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="metaForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="nombre" placeholder="Ej: Ahorro para auto" />
              @if (metaForm.get('nombre')?.hasError('required') && metaForm.get('nombre')?.touched) {
                <mat-error>El nombre es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Monto Objetivo</mat-label>
              <input matInput type="number" formControlName="montoObjetivo" placeholder="0.00" min="0" step="0.01" />
              <span matTextPrefix>S/&nbsp;</span>
              @if (metaForm.get('montoObjetivo')?.hasError('required') && metaForm.get('montoObjetivo')?.touched) {
                <mat-error>El monto objetivo es requerido</mat-error>
              }
              @if (metaForm.get('montoObjetivo')?.hasError('min') && metaForm.get('montoObjetivo')?.touched) {
                <mat-error>El monto debe ser mayor o igual a 0</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha Límite</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="fechaLimite" />
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              @if (metaForm.get('fechaLimite')?.hasError('required') && metaForm.get('fechaLimite')?.touched) {
                <mat-error>La fecha límite es requerida</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="router.navigate(['/metas'])">
                Cancelar
              </button>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="metaForm.invalid || submitting()">
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
export class MetaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private metaService = inject(MetaAhorroService);
  private authService = inject(AuthService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  submitting = signal(false);
  isEditMode = false;
  private editId: number | null = null;

  metaForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    montoObjetivo: [null, [Validators.required, Validators.min(0)]],
    fechaLimite: [new Date(), [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.editId = Number(idParam);

      const metaAEditar = this.metaService.metas().find(m => m.id === this.editId);
      if (metaAEditar) {
        const fechaParseada = typeof metaAEditar.fechaLimite === 'string'
          ? new Date(metaAEditar.fechaLimite + 'T00:00:00')
          : metaAEditar.fechaLimite;

        this.metaForm.patchValue({
          nombre: metaAEditar.nombre,
          montoObjetivo: metaAEditar.montoObjetivo,
          fechaLimite: fechaParseada,
        });
      }
    }
  }

  onSubmit(): void {
    if (this.metaForm.invalid) return;

    this.submitting.set(true);
    const userId = this.authService.currentUserId();
    if (!userId) {
      this.snackBar.open('Error: usuario no autenticado', 'Cerrar', { duration: 5000 });
      this.submitting.set(false);
      return;
    }

    const formValue = this.metaForm.value;
    const fechaLimite: Date = formValue.fechaLimite;
    const fechaStr = fechaLimite instanceof Date
      ? fechaLimite.toISOString().split('T')[0]
      : fechaLimite;

    const dto = {
      nombre: formValue.nombre,
      montoObjetivo: Number(formValue.montoObjetivo),
      fechaLimite: fechaStr,
      usuarioId: userId,
    };

    if (this.isEditMode && this.editId) {
      this.metaService.updateMeta(this.editId, dto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Meta actualizada', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/metas']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al actualizar meta', 'Cerrar', { duration: 5000 });
        }
      });
    } else {
      this.metaService.createMeta(dto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Meta creada exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/metas']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al crear meta', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
