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

  /** Update an existing savings goal details. */
  updateMeta(id: number, dto: Partial<MetaAhorroDTO>): Observable<MetaAhorroDTO> {
    return this.http.put<MetaAhorroDTO>(`/API/editar_meta/${id}`, dto).pipe(
      tap(updated => {
        this.metas.update(list =>
          // Usamos == por seguridad de tipos al comparar con el ID del objeto
          list.map(m => m.id == id ? { ...m, ...updated } : m)
        );
      })
    );
  }

  /** Add an amount to a savings goal. */
  aportarMeta(metaId: number, monto: number): Observable<MetaAhorroDTO> {
    const params = new HttpParams().set('monto', String(monto));
    return this.http.put<MetaAhorroDTO>(`/API/aportar_meta/${metaId}`, null, { params }).pipe(
      tap(updated => {
        this.metas.update(list =>
          // Cambiado a == para asegurar que se reemplace el elemento sin importar el tipado estricto
          list.map(m => m.id == metaId ? updated : m)
        );
      })
    );
  }

  /** Delete a savings goal and remove from the signal list. */
  deleteMeta(id: number): Observable<void> {
    return this.http.delete<void>(`/API/eliminar_meta/${id}`).pipe(
      tap(() => {
        this.metas.update(list => list.filter(m => m.id !== id));
      })
    );
  }
}
