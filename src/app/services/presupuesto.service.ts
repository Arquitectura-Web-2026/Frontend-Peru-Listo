import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap, catchError, of } from 'rxjs';
import { PresupuestoDTO } from '../models/presupuesto.models';

@Injectable({ providedIn: 'root' })
export class PresupuestoService {
  readonly presupuestos = signal<PresupuestoDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Fetch budgets for a user, filtered by month/year. */
  getPresupuestos(usuarioId: number, mes?: number, anio?: number): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams().set('usuarioId', String(usuarioId));
    if (mes !== undefined) params = params.set('mes', String(mes));
    if (anio !== undefined) params = params.set('anio', String(anio));

    this.http.get<PresupuestoDTO[]>('/API/listar_presupuestos', { params }).pipe(
      tap(data => this.presupuestos.set(data)),
      catchError(() => {
        this.error.set('Error al cargar presupuestos');
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  /** Create a new budget and prepend to the signal list. */
  createPresupuesto(dto: Partial<PresupuestoDTO>): Observable<PresupuestoDTO> {
    return this.http.post<PresupuestoDTO>('/API/crear_presupuesto', dto).pipe(
      tap(created => {
        this.presupuestos.update(list => [created, ...list]);
      })
    );
  }

  /** Update budget limit. */
  updatePresupuesto(id: number, monto: number): Observable<PresupuestoDTO> {
    const params = new HttpParams().set('monto', String(monto));
    return this.http.put<PresupuestoDTO>(`/API/editar_presupuesto/${id}`, null, { params }).pipe(
      tap(updated => {
        this.presupuestos.update(list =>
          list.map(p => p.id === id ? updated : p)
        );
      })
    );
  }

  /** Delete a budget and remove from signal list. */
  deletePresupuesto(id: number): Observable<void> {
    return this.http.delete<void>(`/API/eliminar_presupuesto/${id}`).pipe(
      tap(() => {
        this.presupuestos.update(list => list.filter(p => p.id !== id));
      })
    );
  }
}
