import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtResponse, LoginRequest, RegisterRequest } from '../models/auth.models';

interface MessageResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'token';
  private readonly userIdKey = 'userId';
  private readonly correoKey = 'correo';
  private readonly roleKey = 'role';

  /** Signals for reactive auth state — read by guard + interceptor + components */
  readonly isAuthenticated = signal<boolean>(!!localStorage.getItem(this.tokenKey));
  readonly currentUserId = signal<number | null>(
    localStorage.getItem(this.userIdKey) ? Number(localStorage.getItem(this.userIdKey)) : null
  );
  readonly currentUserEmail = signal<string | null>(localStorage.getItem(this.correoKey));
  readonly currentUserRole = signal<string | null>(localStorage.getItem(this.roleKey));

  constructor(private http: HttpClient) {}

  /** Authenticate user. On success: stores JWT, sets signals, redirects to /dashboard. */
  login(email: string, password: string): Observable<JwtResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<JwtResponse>('/API/login', body).pipe(
      tap((response) => {
        this.persistSession(response);
      })
    );
  }

  /** Register new user. Sends only email+password (as accepted by backend AuthController). */
  register(nombreCompleto: string, email: string, password: string): Observable<MessageResponse> {
    // Backend register uses LoginRequest (email + password only).
    // nombreCompleto is stored in interface but sent separately or via profile update.
    const body: LoginRequest = { email, password };
    return this.http.post<MessageResponse>('/API/register', body);
  }

  /** Clear session — localStorage + signals. Call from logout button and interceptor 401 handler. */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.correoKey);
    localStorage.removeItem(this.roleKey);
    this.isAuthenticated.set(false);
    this.currentUserId.set(null);
    this.currentUserEmail.set(null);
    this.currentUserRole.set(null);
  }

  /** Read-only accessors for the interceptor and guard. */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserId(): number | null {
    const raw = localStorage.getItem(this.userIdKey);
    return raw ? Number(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Check if current user has admin role. */
  isAdmin(): boolean {
    const role = this.currentUserRole();
    return role === 'ROLE_ADMIN' || role === 'ADMIN';
  }

  /** Persist JWT + user info to localStorage and update signals. */
  private persistSession(response: JwtResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userIdKey, String(response.id));
    localStorage.setItem(this.correoKey, response.correo);
    localStorage.setItem(this.roleKey, response.role);
    this.isAuthenticated.set(true);
    this.currentUserId.set(Number(response.id));
    this.currentUserEmail.set(response.correo);
    this.currentUserRole.set(response.role);
  }
}
