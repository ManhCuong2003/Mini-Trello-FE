import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div
      class="w-full min-h-screen flex items-center justify-center bg-gray-100"
    >
      <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <h2 class="text-2xl font-bold text-center text-gray-800">
          Welcome to Mini Trello
        </h2>

        <form
          [formGroup]="registerForm"
          (ngSubmit)="onSubmit()"
          class="space-y-4"
        >
          <!-- Họ tên -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700"
              >Name</label
            >
            <input
              type="text"
              id="name"
              formControlName="name"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              [class.border-red-500]="
                name.invalid && (name.dirty || name.touched)
              "
            />
            <div
              class="text-sm text-red-600 mt-1"
              *ngIf="name.invalid && (name.dirty || name.touched)"
            >
              <div *ngIf="name.errors?.['required']">
                Please enter your name.
              </div>
            </div>
          </div>

          <!-- Email -->
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
                email.invalid && (email.dirty || email.touched)
              "
            />
            <div
              class="text-sm text-red-600 mt-1"
              *ngIf="email.invalid && (email.dirty || email.touched)"
            >
              <div *ngIf="email.errors?.['required']">
                Please enter your email.
              </div>
              <div *ngIf="email.errors?.['email']">Email không hợp lệ.</div>
            </div>
          </div>

          <!-- Password -->
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
                password.invalid && (password.dirty || password.touched)
              "
            />
            <div
              class="text-sm text-red-600 mt-1"
              *ngIf="password.invalid && (password.dirty || password.touched)"
            >
              <div *ngIf="password.errors?.['required']">
                Please enter your password.
              </div>
              <div *ngIf="password.errors?.['minlength']">
                Password must be at least 6 characters.
              </div>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700"
            >
              Confirm password</label
            >
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              [class.border-red-500]="
                confirmPassword.invalid &&
                (confirmPassword.dirty || confirmPassword.touched)
              "
            />
            <div
              class="text-sm text-red-600 mt-1"
              *ngIf="
                confirmPassword.invalid &&
                (confirmPassword.dirty || confirmPassword.touched)
              "
            >
              <div *ngIf="confirmPassword.errors?.['required']">
                Please confirm password.
              </div>
            </div>
          </div>

          <div *ngIf="registerError" class="text-sm text-red-600">
            {{ registerError }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isLoading">Sign up</span>
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

        <p class="text-sm text-center text-gray-600">
          Already have an account?
          <a routerLink="/auth/login" class="text-blue-600 hover:underline"
            >Log in</a
          >
        </p>
      </div>
    </div>
  `,
  styles: ``,
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  registerError: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  get name() {
    return this.registerForm.get('name')!;
  }

  get email() {
    return this.registerForm.get('email')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword')!;
  }

  onSubmit() {
    console.log(this.registerForm.value);
    this.registerError = null;
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;
    if (this.confirmPassword.value !== this.password.value) {
      this.registerError = 'Confirm password does not match password.';
      return;
    }
    this.isLoading = true;
    const { name, email, password } = this.registerForm.value;
    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400) {
          this.registerError = 'Email already exist.';
        } else {
          this.registerError = 'An error occurred. Please try again later.';
        }
      },
    });
  }
}
