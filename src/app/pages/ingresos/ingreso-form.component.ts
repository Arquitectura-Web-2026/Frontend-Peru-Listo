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
import { IngresoService } from '../../services/ingreso.service';
import { AuthService } from '../../services/auth.service';
import { IngresoDTO } from '../../models/ingreso.models';

@Component({
  selector: 'app-ingreso-form',
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
          <mat-card-title>{{ isEditMode ? 'Editar Ingreso' : 'Registrar Ingreso' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="ingresoForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <input matInput formControlName="descripcion" placeholder="Ej: Salario" />
              @if (ingresoForm.get('descripcion')?.hasError('required') && ingresoForm.get('descripcion')?.touched) {
                <mat-error>La descripción es requerida</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Monto</mat-label>
              <input matInput type="number" formControlName="monto" placeholder="0.00" min="0" step="0.01" />
              <span matTextPrefix>S/&nbsp;</span>
              @if (ingresoForm.get('monto')?.hasError('required') && ingresoForm.get('monto')?.touched) {
                <mat-error>El monto es requerido</mat-error>
              }
              @if (ingresoForm.get('monto')?.hasError('min') && ingresoForm.get('monto')?.touched) {
                <mat-error>El monto debe ser mayor o igual a 0</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="fecha" />
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              @if (ingresoForm.get('fecha')?.hasError('required') && ingresoForm.get('fecha')?.touched) {
                <mat-error>La fecha es requerida</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="router.navigate(['/ingresos'])">
                Cancelar
              </button>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="ingresoForm.invalid || submitting()">
                @if (submitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ isEditMode ? 'Actualizar' : 'Registrar' }}
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
export class IngresoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ingresoService = inject(IngresoService);
  private authService = inject(AuthService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  submitting = signal(false);
  isEditMode = false;
  private editId: number | null = null;

  ingresoForm: FormGroup = this.fb.group({
    descripcion: ['', [Validators.required]],
    monto: [null, [Validators.required, Validators.min(0)]],
    fecha: [new Date(), [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.editId = Number(idParam);
    }
  }

  onSubmit(): void {
    if (this.ingresoForm.invalid) return;

    this.submitting.set(true);
    const userId = this.authService.currentUserId();
    if (!userId) {
      this.snackBar.open('Error: usuario no autenticado', 'Cerrar', { duration: 5000 });
      this.submitting.set(false);
      return;
    }

    const formValue = this.ingresoForm.value;
    const fecha: Date = formValue.fecha;
    const fechaStr = fecha instanceof Date
      ? fecha.toISOString().split('T')[0]
      : fecha;

    const dto: Partial<IngresoDTO> = {
      descripcion: formValue.descripcion,
      monto: Number(formValue.monto),
      fecha: fechaStr,
      usuarioId: userId,
    };

    if (this.isEditMode && this.editId) {
      this.ingresoService.updateIngreso(this.editId, dto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Ingreso actualizado', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/ingresos']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al actualizar ingreso', 'Cerrar', { duration: 5000 });
        }
      });
    } else {
      this.ingresoService.createIngreso(dto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Ingreso registrado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/ingresos']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al registrar ingreso', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
