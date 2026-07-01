import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CategoriaService } from '../../services/categoria.service';

interface CategoriaDialogData {
  usuarioId: number;
}

@Component({
  selector: 'app-categoria-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Nueva Categoría</h2>
    <mat-dialog-content>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej: Suscripciones" />
          @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
            <mat-error>El nombre es obligatorio</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Color</mat-label>
          <input matInput formControlName="colorHex" type="color" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" type="submit"
              [disabled]="form.invalid"
              (click)="onSubmit()">
        Crear
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    mat-form-field {
      display: block;
      margin-bottom: 8px;
    }
    form {
      padding-top: 8px;
    }
  `]
})
export class CategoriaFormDialogComponent {
  readonly data: CategoriaDialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<CategoriaFormDialogComponent>);
  private categoriaService = inject(CategoriaService);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    colorHex: ['#3f51b5'],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    const { nombre, colorHex } = this.form.value;
    this.categoriaService.createCategoria({
      nombre,
      tipo: 'gasto',
      colorHex,
      usuarioId: this.data.usuarioId,
    }).subscribe({
      next: (created) => {
        this.dialogRef.close(created);
      },
      error: () => {
        // Error is handled by the caller via snackbar;
        // keep dialog open so user can retry
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
