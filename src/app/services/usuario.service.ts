import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { UsuarioDTO, PasswordChangeRequest } from '../models/usuario.models';

interface MessageResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  readonly perfil = signal<UsuarioDTO | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Fetch user profile by ID. */
  getPerfil(id: number): Observable<UsuarioDTO> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<UsuarioDTO>(`/API/perfil/${id}`).pipe(
      tap(data => {
        this.perfil.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set('Error al cargar perfil');
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /** Update user profile fields. */
  updatePerfil(id: number, dto: Partial<UsuarioDTO>): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`/API/actualizar_perfil/${id}`, dto).pipe(
      tap(data => {
        this.perfil.set(data);
      })
    );
  }

  /** Change user password. */
  cambiarPassword(id: number, dto: PasswordChangeRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`/API/cambiar_password/${id}`, dto);
  }
}
