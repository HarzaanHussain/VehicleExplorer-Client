import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/auth/user';
import { AuthResponse } from '../models/auth/auth-response';
import { LoginRequest } from '../models/auth/login-request';
import { RegisterRequest } from '../models/auth/register-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
    // Initialize current user from local storage
    const storedToken = localStorage.getItem(this.tokenKey);
    let storedUser = null;

    if (storedToken) {
      try {
        storedUser = this.parseUserFromToken(storedToken);
      } catch (e) {
        console.error('Error parsing stored token', e);
        localStorage.removeItem(this.tokenKey);
      }
    }

    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();

    console.log('AuthService initialized', { hasToken: !!storedToken, user: storedUser });
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.baseUrl}api/auth/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            const user = this.parseUserFromToken(response.token);
            this.currentUserSubject.next(user);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.baseUrl}api/auth/register`, registerRequest)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            const user = this.parseUserFromToken(response.token);
            this.currentUserSubject.next(user);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private parseUserFromToken(token: string): User | null {
    try {
      // Parse the JWT token
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));

      return {
        id: payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 400) {
        if (error.error && typeof error.error === 'object') {
          if (error.error.errors) {
            const validationErrors = [];
            for (const key in error.error.errors) {
              if (error.error.errors.hasOwnProperty(key)) {
                validationErrors.push(...error.error.errors[key]);
              }
            }
            errorMessage = validationErrors.join('. ');
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        }
      } else if (error.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.status === 0) {
        errorMessage = 'Cannot connect to the server. Please check your connection';
      } else {
        errorMessage = `Server error: ${error.status}. Please try again later`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
