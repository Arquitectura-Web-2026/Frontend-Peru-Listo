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
import { DeudaService } from '../../services/deuda.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-deuda-form',
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
          <mat-card-title>{{ isEditMode ? 'Editar Deuda' : 'Registrar Deuda' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="deudaForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Acreedor</mat-label>
              <input matInput formControlName="acreedor" placeholder="Ej: Banco Interbank" />
              @if (deudaForm.get('acreedor')?.hasError('required') && deudaForm.get('acreedor')?.touched) {
                <mat-error>El acreedor es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Monto</mat-label>
              <input matInput type="number" formControlName="monto" placeholder="0.00" min="0" step="0.01" />
              <span matTextPrefix>S/&nbsp;</span>
              @if (deudaForm.get('monto')?.hasError('required') && deudaForm.get('monto')?.touched) {
                <mat-error>El monto es requerido</mat-error>
              }
              @if (deudaForm.get('monto')?.hasError('min') && deudaForm.get('monto')?.touched) {
                <mat-error>El monto debe ser mayor o igual a 0</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha Límite</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="fechaLimite" />
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              @if (deudaForm.get('fechaLimite')?.hasError('required') && deudaForm.get('fechaLimite')?.touched) {
                <mat-error>La fecha límite es requerida</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="router.navigate(['/deudas'])">
                Cancelar
              </button>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="deudaForm.invalid || submitting()">
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
export class DeudaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private deudaService = inject(DeudaService);
  private authService = inject(AuthService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  submitting = signal(false);
  isEditMode = false;
  private editId: number | null = null;

  deudaForm: FormGroup = this.fb.group({
    acreedor: ['', [Validators.required]],
    monto: [null, [Validators.required, Validators.min(0)]],
    fechaLimite: [new Date(), [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.editId = Number(idParam);

      const deudaAEditar = this.deudaService.deudas().find(d => d.id === this.editId);
      if (deudaAEditar) {
        const fechaParseada = typeof deudaAEditar.fechaLimite === 'string'
          ? new Date(deudaAEditar.fechaLimite + 'T00:00:00')
          : deudaAEditar.fechaLimite;

        this.deudaForm.patchValue({
          acreedor: deudaAEditar.acreedor,
          monto: deudaAEditar.monto,
          fechaLimite: fechaParseada,
        });
      }
    }
  }

  onSubmit(): void {
    if (this.deudaForm.invalid) return;

    this.submitting.set(true);
    const userId = this.authService.currentUserId();
    if (!userId) {
      this.snackBar.open('Error: usuario no autenticado', 'Cerrar', { duration: 5000 });
      this.submitting.set(false);
      return;
    }

    const formValue = this.deudaForm.value;
    const fechaLimite: Date = formValue.fechaLimite;
    const fechaStr = fechaLimite instanceof Date
      ? fechaLimite.toISOString().split('T')[0]
      : fechaLimite;

    const dto = {
      acreedor: formValue.acreedor,
      monto: Number(formValue.monto),
      fechaLimite: fechaStr,
      usuarioId: userId,
      estado: 'PENDIENTE',
    };

    if (this.isEditMode && this.editId) {
      this.deudaService.updateDeuda(this.editId, dto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Deuda actualizada', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/deudas']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al actualizar deuda', 'Cerrar', { duration: 5000 });
        }
      });
    } else {
      this.deudaService.createDeuda(dto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Deuda creada exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/deudas']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al crear deuda', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
