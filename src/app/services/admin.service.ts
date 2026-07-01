import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, catchError, finalize, tap } from 'rxjs';
import { AdminDashboardDTO, AdminUsuarioDTO, AdminUsuarioDetalleDTO } from '../models/admin.models';
import { ArticuloEducacionDTO } from '../models/articulo.models';

interface MessageResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = '/API/admin';

  /** Writable signals for reactive data binding. */
  readonly dashboard = signal<AdminDashboardDTO | null>(null);
  readonly usuarios = signal<AdminUsuarioDTO[]>([]);

  /** Loading and error state signals. */
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Fetch admin dashboard stats. */
  getDashboard(): Observable<AdminDashboardDTO> {
    return this.http.get<AdminDashboardDTO>(`${this.base}/dashboard`).pipe(
      tap(data => this.dashboard.set(data))
    );
  }

  /** Fetch all users for admin view. */
  getUsuarios(): Observable<AdminUsuarioDTO[]> {
    return this.http.get<AdminUsuarioDTO[]>(`${this.base}/usuarios`).pipe(
      tap(data => this.usuarios.set(data))
    );
  }

  /** Fetch single user detail. */
  getUsuarioDetalle(id: number): Observable<AdminUsuarioDetalleDTO> {
    return this.http.get<AdminUsuarioDetalleDTO>(`${this.base}/usuarios/${id}`);
  }

  /** Create new financial education article. */
  createArticulo(dto: ArticuloEducacionDTO): Observable<ArticuloEducacionDTO> {
    return this.http.post<ArticuloEducacionDTO>(`${this.base}/articulos`, dto);
  }

  /** Update an existing article. */
  updateArticulo(id: number, dto: ArticuloEducacionDTO): Observable<ArticuloEducacionDTO> {
    return this.http.put<ArticuloEducacionDTO>(`${this.base}/articulos/${id}`, dto);
  }

  /** Delete an article. */
  deleteArticulo(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/articulos/${id}`);
  }

  /** Load both dashboard and usuarios in parallel. */
  loadAdminDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      dashboard: this.getDashboard(),
      usuarios: this.getUsuarios(),
    }).subscribe({
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar panel de administración');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
}
