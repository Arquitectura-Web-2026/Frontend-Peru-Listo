import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { GastoService } from '../../services/gasto.service';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { GastoDTO } from '../../models/gasto.models';

@Component({
  selector: 'app-gasto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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
          <mat-card-title>{{ isEditMode ? 'Editar Gasto' : 'Crear Gasto' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="gastoForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Categoría</mat-label>
              <mat-select formControlName="categoriaId">
                @for (cat of categoriaService.categorias(); track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.nombre }}</mat-option>
                }
              </mat-select>
              @if (gastoForm.get('categoriaId')?.hasError('required') && gastoForm.get('categoriaId')?.touched) {
                <mat-error>La categoría es requerida</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <input matInput formControlName="descripcion" placeholder="Ej: Supermercado" />
              @if (gastoForm.get('descripcion')?.hasError('required') && gastoForm.get('descripcion')?.touched) {
                <mat-error>La descripción es requerida</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Monto</mat-label>
              <input matInput type="number" formControlName="monto" placeholder="0.00" min="0" step="0.01" />
              <span matTextPrefix>S/&nbsp;</span>
              @if (gastoForm.get('monto')?.hasError('required') && gastoForm.get('monto')?.touched) {
                <mat-error>El monto es requerido</mat-error>
              }
              @if (gastoForm.get('monto')?.hasError('min') && gastoForm.get('monto')?.touched) {
                <mat-error>El monto debe ser mayor o igual a 0</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha del gasto</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="fechagasto" />
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              @if (gastoForm.get('fechagasto')?.hasError('required') && gastoForm.get('fechagasto')?.touched) {
                <mat-error>La fecha es requerida</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="router.navigate(['/gastos'])">
                Cancelar
              </button>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="gastoForm.invalid || submitting()">
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
export class GastoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private gastoService = inject(GastoService);
  protected categoriaService = inject(CategoriaService);
  private authService = inject(AuthService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  submitting = signal(false);
  isEditMode = false;
  private editId: number | null = null;

  gastoForm: FormGroup = this.fb.group({
    categoriaId: [null, [Validators.required]],
    descripcion: ['', [Validators.required]],
    monto: [null, [Validators.required, Validators.min(0)]],
    fechagasto: [new Date(), [Validators.required]],
  });

  ngOnInit(): void {
    const userId = this.authService.currentUserId();
    if (userId) {
      this.categoriaService.getCategorias(userId);
    }

    // Check if we're in edit mode
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.editId = Number(idParam);
      // In a real app, we would load the expense data here
    }
  }

  onSubmit(): void {
    if (this.gastoForm.invalid) return;

    this.submitting.set(true);
    const userId = this.authService.currentUserId();
    if (!userId) {
      this.snackBar.open('Error: usuario no autenticado', 'Cerrar', { duration: 5000 });
      this.submitting.set(false);
      return;
    }

    const formValue = this.gastoForm.value;
    const fechagasto: Date = formValue.fechagasto;
    const fechaStr = fechagasto instanceof Date
      ? fechagasto.toISOString().split('T')[0]
      : fechagasto;

    const dto: Partial<GastoDTO> = {
      descripcion: formValue.descripcion,
      monto: Number(formValue.monto),
      categoriaId: Number(formValue.categoriaId),
      fechagasto: fechaStr,
      usuarioId: userId,
    };

    if (this.isEditMode && this.editId) {
      this.gastoService.updateGasto(this.editId, dto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Gasto actualizado', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/gastos']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al actualizar gasto', 'Cerrar', { duration: 5000 });
        }
      });
    } else {
      this.gastoService.createGasto(dto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Gasto creado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/gastos']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al crear gasto', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
