import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { DashboardResumenDTO, GastosCategoriaDTO, ComparativaMensualDTO } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly base = '/API/dashboard';

  /** Writable signals for reactive data binding in DashboardComponent. */
  readonly resumen = signal<DashboardResumenDTO | null>(null);
  readonly gastosPorCategoria = signal<GastosCategoriaDTO[]>([]);
  readonly comparativaMensual = signal<ComparativaMensualDTO[]>([]);

  /** Loading and error state signals. */
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Fetch monthly summary: total ingresos, total gastos, balance. */
  getResumenMensual(usuarioId: number, mes: number, anio: number): Observable<DashboardResumenDTO> {
    const params = new HttpParams()
      .set('usuarioId', String(usuarioId))
      .set('mes', String(mes))
      .set('anio', String(anio));

    return this.http.get<DashboardResumenDTO>(`${this.base}/resumen_mensual`, { params }).pipe(
      tap(data => this.resumen.set(data))
    );
  }

  /** Fetch expenses grouped by category. */
  getGastosPorCategoria(usuarioId: number, mes: number, anio: number): Observable<GastosCategoriaDTO[]> {
    const params = new HttpParams()
      .set('usuarioId', String(usuarioId))
      .set('mes', String(mes))
      .set('anio', String(anio));

    return this.http.get<GastosCategoriaDTO[]>(`${this.base}/gastos_por_categoria`, { params }).pipe(
      tap(data => this.gastosPorCategoria.set(data))
    );
  }

  /** Fetch monthly comparison (ingresos vs gastos over N months). */
  getComparativaMensual(usuarioId: number, meses: number = 6): Observable<ComparativaMensualDTO[]> {
    const params = new HttpParams()
      .set('usuarioId', String(usuarioId))
      .set('meses', String(meses));

    return this.http.get<ComparativaMensualDTO[]>(`${this.base}/comparativa_mensual`, { params }).pipe(
      tap(data => this.comparativaMensual.set(data))
    );
  }

  /** Load all dashboard data in parallel and manage loading/error state. */
  loadDashboard(usuarioId: number, mes: number, anio: number): void {
    this.loading.set(true);
    this.error.set(null);

    const resumen$ = this.getResumenMensual(usuarioId, mes, anio);
    const categorias$ = this.getGastosPorCategoria(usuarioId, mes, anio);
    const comparativa$ = this.getComparativaMensual(usuarioId);

    of(null).pipe(
      tap(() => {
        resumen$.subscribe();
        categorias$.subscribe();
        comparativa$.subscribe({
          next: () => this.loading.set(false),
          error: (err) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Error al cargar el dashboard');
          }
        });
      })
    ).subscribe();
  }
}
