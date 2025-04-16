import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { take } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header class="bg-white p-6 flex justify-between items-center shadow">
      <h1 routerLink="/boards" class="text-3xl font-bold text-gray-800 cursor-pointer">Mini Trello</h1>
      <div class="flex items-center gap-4">
        <span class="text-lg">{{ userName() }}</span>
        <button
          (click)="logout()"
          class="p-2 rounded-lg text-white bg-red-500 cursor-pointer"
        >
          <svg
            class="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
            />
          </svg>
        </button>
      </div>
    </header>
  `,
  styles: ``,
})
export class HeaderComponent implements OnInit {
  userName = signal<string>('');

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user
      .pipe(take(1))
      .subscribe((user) => this.userName.set(user.name));
  }

  logout(): void {
    this.authService.logout();
  }
}
