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
import { AdminService } from '../../../services/admin.service';
import { ArticuloService } from '../../../services/articulo.service';
import { ArticuloEducacionDTO } from '../../../models/articulo.models';

@Component({
  selector: 'app-admin-articulo-form',
  standalone: true,
  imports: [
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
          <mat-card-title>{{ isEditMode ? 'Editar Artículo' : 'Crear Artículo' }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="articuloForm" (ngSubmit)="onSubmit()">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título</mat-label>
              <input matInput formControlName="titulo" placeholder="Ej: Cómo ahorrar para el futuro" />
              @if (articuloForm.get('titulo')?.hasError('required') && articuloForm.get('titulo')?.touched) {
                <mat-error>El título es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción Corta</mat-label>
              <textarea matInput formControlName="descripcionCorta" rows="2" placeholder="Breve descripción del artículo"></textarea>
              @if (articuloForm.get('descripcionCorta')?.hasError('required') && articuloForm.get('descripcionCorta')?.touched) {
                <mat-error>La descripción corta es requerida</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cuerpo del artículo</mat-label>
              <textarea matInput formControlName="cuerpo" rows="12" placeholder="Escribe el contenido del artículo. Separa los párrafos con doble Enter.&#10;&#10;Ejemplo:&#10;Primer párrafo del artículo explicando el tema.&#10;&#10;Segundo párrafo con más detalles y consejos prácticos."></textarea>
              @if (articuloForm.get('cuerpo')?.hasError('required') && articuloForm.get('cuerpo')?.touched) {
                <mat-error>El cuerpo del artículo es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Categoría Temática</mat-label>
              <mat-select formControlName="categoriaTematica">
                @for (cat of categorias; track cat) {
                  <mat-option [value]="cat">{{ cat }}</mat-option>
                }
              </mat-select>
              @if (articuloForm.get('categoriaTematica')?.hasError('required') && articuloForm.get('categoriaTematica')?.touched) {
                <mat-error>La categoría es requerida</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" (click)="router.navigate(['/admin/articulos'])">
                Cancelar
              </button>
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="articuloForm.invalid || submitting()">
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
      max-width: 700px;
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
export class AdminArticuloFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private articuloService = inject(ArticuloService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  submitting = signal(false);
  isEditMode = false;
  private editId: number | null = null;

  readonly categorias = ['Ahorro', 'Inversión', 'Deudas', 'Presupuesto', 'Impuestos'];

  articuloForm: FormGroup = this.fb.group({
    titulo: ['', [Validators.required]],
    descripcionCorta: ['', [Validators.required]],
    cuerpo: ['', [Validators.required]],
    categoriaTematica: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.editId = Number(idParam);
      this.loadArticuloForEdit(this.editId);
    }
  }

  private loadArticuloForEdit(id: number): void {
    this.articuloService.getArticulo(id).subscribe({
      next: (articulo) => {
        this.articuloForm.patchValue({
          titulo: articulo.titulo,
          descripcionCorta: articulo.descripcionCorta,
          cuerpo: articulo.cuerpo,
          categoriaTematica: articulo.categoriaTematica,
        });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al cargar artículo', 'Cerrar', { duration: 5000 });
        this.router.navigate(['/admin/articulos']);
      }
    });
  }

  onSubmit(): void {
    if (this.articuloForm.invalid) return;

    this.submitting.set(true);
    const formValue = this.articuloForm.value;

    const dto: ArticuloEducacionDTO = {
      titulo: formValue.titulo,
      descripcionCorta: formValue.descripcionCorta,
      cuerpo: formValue.cuerpo,
      categoriaTematica: formValue.categoriaTematica,
    };

    if (this.isEditMode && this.editId) {
      this.adminService.updateArticulo(this.editId, dto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Artículo actualizado con éxito', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/admin/articulos']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al actualizar artículo', 'Cerrar', { duration: 5000 });
        }
      });
    } else {
      this.adminService.createArticulo(dto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Artículo creado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/admin/articulos']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.snackBar.open(err.error?.message || 'Error al crear artículo', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
