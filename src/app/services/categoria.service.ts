import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, tap, catchError, of } from 'rxjs';
import { CategoriaDTO } from '../models/gasto.models';

interface CategoriaInput {
  nombre: string;
  tipo: string;
  colorHex: string;
  usuarioId: number;
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  readonly categorias = signal<CategoriaDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Fetch categories for a user. Populates the categorias signal. */
  getCategorias(usuarioId: number): void {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams().set('usuarioId', String(usuarioId));

    this.http.get<CategoriaDTO[]>('/API/listar_categorias', { params }).pipe(
      tap(data => this.categorias.set(data)),
      catchError(() => {
        this.error.set('Error al cargar categorías');
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  /** Create a new category and prepend to the signal list. */
  createCategoria(dto: CategoriaInput): Observable<CategoriaDTO> {
    return this.http.post<CategoriaDTO>('/API/crear_categoria', dto).pipe(
      tap(created => {
        this.categorias.update(list => [...list, created]);
      })
    );
  }
}
