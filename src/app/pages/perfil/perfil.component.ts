import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { PasswordChangeRequest } from '../../models/usuario.models';

const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword
    ? { mismatch: true }
    : null;
};

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  template: `
    <div class="perfil-container">
      <h1>Perfil</h1>

      @if (usuarioService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando perfil...</p>
        </div>
      }

      <!-- Profile Info Card -->
      @if (usuarioService.perfil() && !usuarioService.loading()) {
        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>Información Personal</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (!editMode) {
              <div class="profile-info">
                <p><strong>Nombre:</strong> {{ usuarioService.perfil()?.nombreCompleto }}</p>
                <p><strong>Correo:</strong> {{ usuarioService.perfil()?.correo }}</p>
                <p><strong>Fecha de registro:</strong> {{ usuarioService.perfil()?.fechaRegistro | date:'dd/MM/yyyy' }}</p>
              </div>
              <button mat-stroked-button color="primary" (click)="toggleEdit()">Editar</button>
            } @else {
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nombre completo</mat-label>
                  <input matInput formControlName="nombreCompleto" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Correo electrónico</mat-label>
                  <input matInput type="email" formControlName="correo" />
                </mat-form-field>
                <div class="form-actions">
                  <button mat-stroked-button type="button" (click)="toggleEdit()">Cancelar</button>
                  <button mat-flat-button color="primary" type="submit" [disabled]="profileForm.invalid || saving()">
                    @if (saving()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      Guardar
                    }
                  </button>
                </div>
              </form>
            }
          </mat-card-content>
        </mat-card>
      }

      <!-- Password Change Card -->
      <mat-card class="section-card">
        <mat-card-header>
          <mat-card-title>Cambiar Contraseña</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña actual</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="currentPassword" />
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nueva contraseña</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="newPassword" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar nueva contraseña</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="confirmPassword" />
              @if (passwordForm.hasError('mismatch') && passwordForm.get('confirmPassword')?.touched) {
                <mat-error>Las contraseñas no coinciden</mat-error>
              }
            </mat-form-field>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="passwordForm.invalid || changingPassword()">
              @if (changingPassword()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Cambiar contraseña
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .perfil-container {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 28px;
      font-weight: 500;
    }
    .section-card {
      margin-bottom: 24px;
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
    .profile-info p {
      margin: 8px 0;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
    }
    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class PerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  hidePassword = signal(true);
  editMode = false;
  saving = signal(false);
  changingPassword = signal(false);

  profileForm: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordsMatchValidator });

  ngOnInit(): void {
    const userId = this.authService.currentUserId();
    if (userId) {
      this.usuarioService.getPerfil(userId).subscribe({
        next: (perfil) => {
          this.profileForm.patchValue({
            nombreCompleto: perfil.nombreCompleto,
            correo: perfil.correo,
          });
        }
      });
    }
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Reset form to current profile values
      const perfil = this.usuarioService.perfil();
      if (perfil) {
        this.profileForm.patchValue({
          nombreCompleto: perfil.nombreCompleto,
          correo: perfil.correo,
        });
      }
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    const userId = this.authService.currentUserId();
    if (!userId) return;

    this.saving.set(true);
    this.usuarioService.updatePerfil(userId, this.profileForm.value).subscribe({
      next: () => {
        this.saving.set(false);
        this.editMode = false;
        this.snackBar.open('Perfil actualizado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err.error?.message || 'Error al actualizar perfil', 'Cerrar', { duration: 5000 });
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const userId = this.authService.currentUserId();
    if (!userId) return;

    this.changingPassword.set(true);
    const dto: PasswordChangeRequest = this.passwordForm.value;
    this.usuarioService.cambiarPassword(userId, dto).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset();
        this.snackBar.open('Contraseña cambiada exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.changingPassword.set(false);
        this.snackBar.open(err.error?.message || 'Error al cambiar contraseña', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
