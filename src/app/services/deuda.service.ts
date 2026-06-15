import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap, catchError, of } from 'rxjs';
import { DeudaDTO } from '../models/deuda.models';

@Injectable({ providedIn: 'root' })
export class DeudaService {
  readonly deudas = signal<DeudaDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Fetch debts for a user. */
  getDeudas(usuarioId: number): void {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams().set('usuarioId', String(usuarioId));

    this.http.get<DeudaDTO[]>('/API/listar_deudas', { params }).pipe(
      tap(data => this.deudas.set(data)),
      catchError(() => {
        this.error.set('Error al cargar deudas');
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  /** Create a new debt and prepend to signal list. */
  createDeuda(dto: Partial<DeudaDTO>): Observable<DeudaDTO> {
    return this.http.post<DeudaDTO>('/API/registrar_deuda', dto).pipe(
      tap(created => {
        this.deudas.update(list => [created, ...list]);
      })
    );
  }

  /** Update an existing debt. */
  updateDeuda(id: number, dto: Partial<DeudaDTO>): Observable<DeudaDTO> {
    return this.http.put<DeudaDTO>(`/API/editar_deuda/${id}`, dto).pipe(
      tap(updated => {
        this.deudas.update(list =>
          list.map(d => d.id === id ? updated : d)
        );
      })
    );
  }

  /** Mark a debt as paid. */
  marcarPagada(id: number): Observable<DeudaDTO> {
    return this.http.put<DeudaDTO>(`/API/marcar_pagada/${id}`, {}).pipe(
      tap(updated => {
        this.deudas.update(list =>
          list.map(d => d.id === id ? updated : d)
        );
      })
    );
  }

  /** Delete a debt and remove from signal list. */
  deleteDeuda(id: number): Observable<void> {
    return this.http.delete<void>(`/API/eliminar_deuda/${id}`).pipe(
      tap(() => {
        this.deudas.update(list => list.filter(d => d.id !== id));
      })
    );
  }
}
