import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true,
  template: `
    <div
      class="w-full min-h-screen flex items-center justify-center bg-gray-100"
    >
      <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <!-- Tiêu đề -->
        <h2 class="text-2xl font-bold text-center text-gray-800">
          Welcome to Mini Trello
        </h2>

        <!-- Form đăng nhập -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"
              >Email</label
            >
            <input
              type="email"
              id="email"
              formControlName="email"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              [class.border-red-500]="
                email?.invalid && (email?.dirty || email?.touched)
              "
            />
            <div
              *ngIf="email?.invalid && (email?.dirty || email?.touched)"
              class="text-red-500"
            >
              <div *ngIf="email?.errors?.['required']">
                Please enter your email.
              </div>
              <div *ngIf="email?.errors?.['email']">
                Email is not in correct format.
              </div>
            </div>
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
              >Password</label
            >
            <input
              type="password"
              id="password"
              formControlName="password"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              [class.border-red-500]="
                password?.invalid && (password?.dirty || password?.touched)
              "
            />
            <div
              *ngIf="
                password?.invalid && (password?.dirty || password?.touched)
              "
              class="text-red-500"
            >
              <div *ngIf="password?.errors?.['required']">
                Please enter your password.
              </div>
            </div>
          </div>

          <div *ngIf="loginError" class="text-sm text-red-500 text-center">
            {{ loginError }}
          </div>

          <button
            type="submit"
            class="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isLoading">Login</span>
            <span *ngIf="isLoading" class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  stroke-width="4"
                  fill="none"
                />
                <path
                  class="opacity-75"
                  fill="white"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </span>
          </button>
        </form>

        <!-- Hoặc -->
        <div class="flex items-center gap-2">
          <div class="flex-grow h-px bg-gray-300"></div>
          <span class="text-sm text-gray-500">Or</span>
          <div class="flex-grow h-px bg-gray-300"></div>
        </div>

        <!-- Nút đăng nhập bằng Google -->
        <button
          (click)="loginWithGoogle()"
          class="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            class="w-5 h-5"
            alt="Google Icon"
          />
          Sign in with Google
        </button>

        <!-- Link đến trang đăng ký -->
        <p class="text-sm text-center text-gray-600">
          Don't have an account?
          <a
            routerLink="/auth/register"
            class="text-blue-600 hover:underline cursor-pointer"
            >Sign up now</a
          >
        </p>
      </div>
    </div>
  `,
  styles: ``,
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  loginError: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    this.loginError = null;
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        console.log('login thanh cong');
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error && err.error.message) {
          this.loginError = err.error.message;
        } else if (err.status === 401) {
          this.loginError = 'Email or password is wrong.';
        } else if (err.status === 404) {
          this.loginError = 'Email not exist.';
        } else {
          this.loginError = 'An error occurred. Please try again later.';
        }
      },
    });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}
