import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Board, BoardService } from '../../services/board/board.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-board-list',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <app-header />
      <div class="mx-auto p-6">
        <div
          class="flex justify-between items-center"
          [class.mb-8]="boards().length > 0"
        >
          <h2 class="text-2xl font-bold text-gray-800">My boards</h2>
          <button
            (click)="openCreateBoardModal()"
            class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-6 text-white py-2 rounded-lg cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Board
          </button>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <div
            *ngFor="let board of boards()"
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div class="p-6">
              <div class="flex justify-between items-start">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">
                  {{ board.name }}
                </h3>
                <button
                  (click)="openDeleteBoardModal(board)"
                  class="text-gray-500 hover:text-red-500 transition-colors duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <p class="text-gray-600 text-sm">
                {{ board.createdAt | date : 'medium' }}
              </p>
            </div>
            <div class="p-4 border-t border-gray-200">
              <button
                (click)="navigateToBoard(board._id)"
                class="w-full text-blue-600 hover:text-blue-700 font-medium text-sm flex justify-center items-center gap-2 cursor-pointer"
              >
                <span>Open Board</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- loading -->
        <div *ngIf="isLoading()" class="text-center mt-[15%]">
          <h1 class="text-2xl font-semibold">Loading...</h1>
        </div>

        <div
          *ngIf="boards().length === 0 && isLoading() === false"
          class="text-center mt-[10%]"
        >
          <img
            src="https://images.unsplash.com/photo-1622737133809-d95047b9e673"
            alt="Empty boards"
            class="w-48 h-48 mx-auto mb-4 rounded-lg object-cover"
          />
          <h2 class="text-xl font-semibold text-gray-800 mb-2">
            No Boards Yet
          </h2>
          <p class="text-gray-600 mb-4">
            Create your first board to get started!
          </p>
          <button
            (click)="openCreateBoardModal()"
            class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-6 text-white py-2 rounded-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Board
          </button>
        </div>

        <!-- add board modal -->
        <div
          *ngIf="isCreateModalOpen()"
          class="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
        >
          <div
            class="bg-white w-full max-w-md rounded-lg p-6"
            (click)="$event.stopPropagation()"
          >
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
              Create new board
            </h2>
            <form [formGroup]="boardForm" (ngSubmit)="createBoard()">
              <div class="mb-4">
                <label
                  for="boardName"
                  class="block text-gray-700 font-medium mb-2"
                  >Board Name</label
                >
                <input
                  id="boardName"
                  type="text"
                  placeholder="Enter board name"
                  formControlName="boardName"
                  class="w-full border border-gray-300 px-4 py-2 rounded-lg placeholder:text-gray-400 focus:ring-blue-500 focus:ring-2 focus:border-none focus:outline-none"
                  [class.border-red-500]="
                    boardForm.get('boardName')?.invalid &&
                    (boardForm.get('boardName')?.dirty ||
                      boardForm.get('boardName')?.touched)
                  "
                />
                <div
                  *ngIf="boardForm.get('boardName')?.invalid || errorMessage"
                  class="text-red-500 text-sm mt-1"
                >
                  <span
                    *ngIf="
                      boardForm.get('boardName')?.invalid &&
                      (boardForm.get('boardName')?.dirty ||
                        boardForm.get('boardName')?.touched)
                    "
                    >Board name is required</span
                  >
                  <span *ngIf="errorMessage()">{{ errorMessage() }}</span>
                </div>
              </div>
              <div class="flex justify-end gap-4">
                <button
                  type="button"
                  (click)="closeCreateBoardModal()"
                  class="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Create board
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- delete board modal -->
        <div
          *ngIf="isDeleteModalOpen()"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <!-- Modal content -->
          <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 class="text-lg font-semibold mb-4">Comfirm to delete board</h2>
            <p class="text-gray-600 mb-6">
              Are you sure to delete "<strong>{{
                selectedBoard()?.name
              }}</strong
              >" board?
            </p>

            <div class="flex justify-end gap-3">
              <button
                class="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                (click)="closeDeleteModal()"
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                (click)="confirmDeleteBoard(selectedBoard()?._id!)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class BoardListComponent implements OnInit {
  boards = signal<Board[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  isCreateModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedBoard = signal<Board | null>(null);
  boardForm: FormGroup;

  constructor(
    private boardService: BoardService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.boardForm = this.fb.group({
      boardName: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.boardService.getBoards().subscribe({
      next: (data) => {
        this.boards.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching boards:', err);
        this.isLoading.set(false);
      },
    });
  }

  openCreateBoardModal(): void {
    this.isCreateModalOpen.update((prev) => !prev);
  }

  closeCreateBoardModal(): void {
    this.isCreateModalOpen.update((prev) => !prev);
    this.boardForm.reset();
  }

  openDeleteBoardModal(board: Board) {
    this.selectedBoard.set(board);
    this.isDeleteModalOpen.update((prev) => !prev);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.update((prev) => !prev);
    this.selectedBoard.set(null);
  }

  confirmDeleteBoard(boardId: string): void {
    if (!this.selectedBoard()) {
      return;
    }

    this.boardService.deleteBoard(boardId).subscribe({
      next: () => {
        this.boards.update((boards) => boards.filter((b) => b._id !== boardId));
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error deleting board:', err);
        this.errorMessage.set(err.error?.message || 'Xóa bảng thất bại.');
      },
    });
  }

  createBoard(): void {
    this.boardForm.markAllAsTouched();
    if (this.boardForm.invalid) {
      return;
    }

    this.boardService
      .createBoard(this.boardForm.get('boardName')?.value)
      .subscribe({
        next: () => {
          this.loadBoards();
          this.closeCreateBoardModal();
          this.boardForm.reset();
        },
        error: (err) => {
          console.error('Error creating board:', err);
          this.errorMessage.set(
            err.error?.message || 'Create new board failed.'
          );
        },
      });
  }

  navigateToBoard(boardId: string) {
    this.router.navigate(['/boards', boardId]);
  }
}
