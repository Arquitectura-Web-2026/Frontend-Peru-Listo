import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap, catchError, of } from 'rxjs';
import { IngresoDTO } from '../models/ingreso.models';

@Injectable({ providedIn: 'root' })
export class IngresoService {
  readonly ingresos = signal<IngresoDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Fetch income entries for a user, optionally filtered by month/year. */
  getIngresos(usuarioId: number, mes?: number, anio?: number): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams().set('usuarioId', String(usuarioId));
    if (mes !== undefined) params = params.set('mes', String(mes));
    if (anio !== undefined) params = params.set('anio', String(anio));

    this.http.get<IngresoDTO[]>('/API/listar_ingresos', { params }).pipe(
      tap(data => this.ingresos.set(data)),
      catchError(() => {
        this.error.set('Error al cargar ingresos');
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  /** Create a new income entry and prepend to the signal list. */
  createIngreso(dto: Partial<IngresoDTO>): Observable<IngresoDTO> {
    return this.http.post<IngresoDTO>('/API/registrar_ingreso', dto).pipe(
      tap(created => {
        this.ingresos.update(list => [created, ...list]);
      })
    );
  }

  /** Update an existing income entry and replace in the signal list. */
  updateIngreso(id: number, dto: Partial<IngresoDTO>): Observable<IngresoDTO> {
    return this.http.put<IngresoDTO>(`/API/editar_ingreso/${id}`, dto).pipe(
      tap(updated => {
        this.ingresos.update(list =>
          list.map(i => i.id === id ? updated : i)
        );
      })
    );
  }

  /** Delete an income entry and remove from the signal list. */
  deleteIngreso(id: number): Observable<void> {
    return this.http.delete<void>(`/API/eliminar_ingreso/${id}`).pipe(
      tap(() => {
        this.ingresos.update(list => list.filter(i => i.id !== id));
      })
    );
  }
}
