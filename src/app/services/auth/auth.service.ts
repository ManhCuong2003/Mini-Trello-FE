import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private currentUser = new BehaviorSubject<any>(null);

  isLoggedIn = this.loggedIn.asObservable();
  user = this.currentUser.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    if (this.hasToken()) {
      this.loadUserProfile();
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  private storeToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.loggedIn.next(true);
  }

  private storeUserData(user: any) {
    localStorage.setItem('userData', JSON.stringify(user));
    this.currentUser.next(user);
  }

  loadUserProfile(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.currentUser.next(JSON.parse(userData));
      this.loggedIn.next(true);
    }
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.storeToken(response.token);
          this.storeUserData(response.user);
          //this.router.navigate(['/dashboard']);
        })
      );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response) => {
          this.storeToken(response.token);
          this.storeUserData(response.user);
          //this.router.navigate(['/dashboard']);
        })
      );
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:5000/api/auth/google';
  }

  handleGoogleCallback(token: string, userData: any): void {
    this.storeToken(token);
    this.storeUserData(userData);
    this.loggedIn.next(true);
    this.router.navigate(['boards']);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.loggedIn.next(false);
    this.currentUser.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  public clearAuthData(): void {
    console.log('AuthService: Clearing auth data due to 401 from Interceptor');
    this.loggedIn.next(false);
    this.currentUser.next(null);
  }
}
