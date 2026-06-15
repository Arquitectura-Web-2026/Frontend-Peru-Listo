import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap, catchError, of } from 'rxjs';
import { MetaAhorroDTO } from '../models/meta.models';

@Injectable({ providedIn: 'root' })
export class MetaAhorroService {
  readonly metas = signal<MetaAhorroDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Fetch savings goals for a user. */
  getMetas(usuarioId: number): void {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams().set('usuarioId', String(usuarioId));

    this.http.get<MetaAhorroDTO[]>('/API/listar_metas', { params }).pipe(
      tap(data => this.metas.set(data)),
      catchError(() => {
        this.error.set('Error al cargar metas de ahorro');
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  /** Create a new savings goal and prepend to signal list. */
  createMeta(dto: Partial<MetaAhorroDTO>): Observable<MetaAhorroDTO> {
    return this.http.post<MetaAhorroDTO>('/API/crear_meta', dto).pipe(
      tap(created => {
        this.metas.update(list => [created, ...list]);
      })
    );
  }

  /** Add an amount to a savings goal. */
  aportarMeta(metaId: number, monto: number): Observable<MetaAhorroDTO> {
    return this.http.put<MetaAhorroDTO>(`/API/aportar_meta/${metaId}`, { monto }).pipe(
      tap(updated => {
        this.metas.update(list =>
          list.map(m => m.id === metaId ? updated : m)
        );
      })
    );
  }
}
