import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap, catchError, of } from 'rxjs';
import { GastoDTO } from '../models/gasto.models';

@Injectable({ providedIn: 'root' })
export class GastoService {
  readonly gastos = signal<GastoDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Fetch expenses for a user, optionally filtered by month/year. */
  getGastos(usuarioId: number, mes?: number, anio?: number): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams().set('usuarioId', String(usuarioId));
    if (mes !== undefined) params = params.set('mes', String(mes));
    if (anio !== undefined) params = params.set('anio', String(anio));

    this.http.get<GastoDTO[]>('/API/listar_gastos', { params }).pipe(
      tap(data => this.gastos.set(data)),
      catchError(() => {
        this.error.set('Error al cargar gastos');
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  /** Create a new expense and prepend to the signal list. */
  /*
  createGasto(dto: Partial<GastoDTO>): Observable<GastoDTO> {
    return this.http.post<GastoDTO>('/API/registrar_gasto', dto).pipe(
      tap(created => {
        this.gastos.update(list => [created, ...list]);
      })
    );
  }*/

  createGasto(dto: Partial<GastoDTO>): Observable<GastoDTO> {
    return this.http.post<GastoDTO>('/API/registrar_gasto', dto).pipe(
      tap(created => {
        // Forzamos a que el objeto mantenga la propiedad plana 'categoriaId'
        const gastoFormateado: any = {
          ...created,
          categoriaId: (created as any).categoriaId || (created as any).categoria?.id
        };
        this.gastos.update(list => [gastoFormateado, ...list]);
      })
    );
  }




  /** Update an existing expense and replace in the signal list. */
  updateGasto(id: number, dto: Partial<GastoDTO>): Observable<GastoDTO> {
    return this.http.put<GastoDTO>(`/API/editar_gasto/${id}`, dto).pipe(
      tap(updated => {
        const gastoFormateado: any = {
          ...updated,
          // Mapea el ID plano provisto por el DTO si el backend retorna la entidad vacía o diferente
          categoriaId: Number(updated?.categoriaId || (updated as any).categoria?.id || dto.categoriaId)
        };
        this.gastos.update(list =>
          list.map(g => g.id == id ? gastoFormateado : g)
        );
      })
    );
  }


  /** Delete an expense and remove from the signal list. */
  deleteGasto(id: number): Observable<void> {
    return this.http.delete<void>(`/API/eliminar_gasto/${id}`).pipe(
      tap(() => {
        this.gastos.update(list => list.filter(g => g.id !== id));
      })
    );
  }

  /** Search expenses by query string. */
  searchGastos(usuarioId: number, q: string): void {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams()
      .set('usuarioId', String(usuarioId))
      .set('q', q);

    this.http.get<GastoDTO[]>('/API/buscar_gastos', { params }).pipe(
      tap(data => this.gastos.set(data)),
      catchError(() => {
        this.error.set('Error al buscar gastos');
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }
}
