import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, finalize, tap } from 'rxjs';
import { ArticuloEducacionDTO } from '../models/articulo.models';

@Injectable({ providedIn: 'root' })
export class ArticuloService {
  private readonly base = '/API';

  /** Writable signals for reactive data binding. */
  readonly articulos = signal<ArticuloEducacionDTO[]>([]);

  /** Loading and error state signals. */
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Fetch paginated articles list. */
  getArticulos(page: number = 0, size: number = 10): Observable<ArticuloEducacionDTO[]> {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));

    return this.http.get<ArticuloEducacionDTO[]>(`${this.base}/listar_articulos`, { params }).pipe(
      tap(data => this.articulos.set(data)),
      catchError((err) => {
        this.error.set(err.error?.message || 'Error al cargar artículos');
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /** Fetch single article by id. */
  getArticulo(id: number): Observable<ArticuloEducacionDTO> {
    return this.http.get<ArticuloEducacionDTO>(`${this.base}/ver_articulo/${id}`);
  }

  /** Filter articles by category. */
  filtrarPorCategoria(categoria: string): Observable<ArticuloEducacionDTO[]> {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams().set('categoria', categoria);

    return this.http.get<ArticuloEducacionDTO[]>(`${this.base}/filtrar_articulos`, { params }).pipe(
      tap(data => this.articulos.set(data)),
      catchError((err) => {
        this.error.set(err.error?.message || 'Error al filtrar artículos');
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  /** Get suggested articles for a user. */
  sugerirArticulos(usuarioId: number): Observable<ArticuloEducacionDTO[]> {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams().set('usuarioId', String(usuarioId));

    return this.http.get<ArticuloEducacionDTO[]>(`${this.base}/sugerir_articulos`, { params }).pipe(
      tap(data => this.articulos.set(data)),
      catchError((err) => {
        this.error.set(err.error?.message || 'Error al sugerir artículos');
        throw err;
      }),
      finalize(() => this.loading.set(false))
    );
  }
}
