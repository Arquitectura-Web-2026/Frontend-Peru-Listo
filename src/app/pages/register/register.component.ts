import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

/** Validator: checks that password and confirmPassword match. */
const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword
    ? { mismatch: true }
    : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Crear cuenta</mat-card-title>
          <mat-card-subtitle>Regístrate para empezar a gestionar tus finanzas</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="nombreCompleto" placeholder="Tu nombre" />
              <mat-icon matPrefix>person</mat-icon>
              @if (registerForm.get('nombreCompleto')?.hasError('required') && registerForm.get('nombreCompleto')?.touched) {
                <mat-error>El nombre es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo electrónico</mat-label>
              <input matInput type="email" formControlName="email" placeholder="tu@correo.com" />
              <mat-icon matPrefix>email</mat-icon>
              @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                <mat-error>El correo es requerido</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                <mat-error>Ingresa un correo válido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password" />
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                <mat-error>La contraseña es requerida</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                <mat-error>La contraseña debe tener al menos 6 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar contraseña</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="confirmPassword" />
              <mat-icon matPrefix>lock</mat-icon>
              @if (registerForm.hasError('mismatch') && registerForm.get('confirmPassword')?.touched) {
                <mat-error>Las contraseñas no coinciden</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="full-width"
              [disabled]="registerForm.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Registrarse
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <span>¿Ya tienes cuenta?</span>
          <a mat-button routerLink="/login">Iniciar sesión</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #3f51b5 0%, #e91e63 100%);
    }
    .register-card {
      width: 100%;
      max-width: 400px;
      margin: 16px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 12px;
    }
    mat-card-header {
      margin-bottom: 16px;
    }
    mat-card-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  hidePassword = signal(true);
  loading = signal(false);

  registerForm: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordsMatchValidator });

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading.set(true);
    const { nombreCompleto, email, password } = this.registerForm.value;

    this.authService.register(nombreCompleto, email, password).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.snackBar.open(response.message || 'Registro exitoso', 'Cerrar', { duration: 5000 });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.message || 'Error al registrarse';
        this.snackBar.open(message, 'Cerrar', { duration: 5000, panelClass: 'error-snackbar' });
      }
    });
  }
}
