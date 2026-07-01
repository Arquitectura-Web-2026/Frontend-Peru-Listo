import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface AportarDialogData {
  metaId: number;
  metaNombre: string;
}

@Component({
  selector: 'app-aportar-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Aportar a "{{ data.metaNombre }}"</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Monto</mat-label>
          <input matInput type="number" formControlName="monto" placeholder="0.00" min="0.01" step="0.01" />
          <span matTextPrefix>S/&nbsp;</span>
          @if (form.get('monto')?.hasError('required') && form.get('monto')?.touched) {
            <mat-error>El monto es requerido</mat-error>
          }
          @if (form.get('monto')?.hasError('min') && form.get('monto')?.touched) {
            <mat-error>El monto debe ser mayor a 0</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="aportar()">Aportar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
  `]
})
export class AportarDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AportarDialogComponent>);
  protected data: AportarDialogData = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    monto: [null, [Validators.required, Validators.min(0.01)]],
  });

  aportar(): void {
    if (this.form.valid) {
      this.dialogRef.close(Number(this.form.value.monto));
    }
  }
}
