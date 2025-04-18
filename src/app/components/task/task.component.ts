import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Task } from '../../services/board/board.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task',
  imports: [CommonModule],
  template: `
    <div
      class="bg-white p-4 rounded-lg shadow mb-3 cursor-move hover:shadow-md transition-shadow duration-200"
    >
      <div class="flex items-center justify-between">
        <h4>{{ task.title }}</h4>
        <button
          (click)="openDeleteTaskModal()"
          class="text-gray-400 hover:text-red-500"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <p *ngIf="task.description" class="text-sm text-gray-600 mt-2">
        {{ task.description }}
      </p>
      <div
        *ngIf="isDeleteModalOpen()"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <!-- Modal content -->
        <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <h2 class="text-lg font-semibold mb-4">Comfirm to delete task</h2>
          <p class="text-gray-600 mb-6">
            Are you sure to delete "<strong>{{ task.title }}</strong
            >" task?
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
              (click)="onDelete()"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class TaskComponent {
  @Input({ required: true }) task!: Task;
  @Output() deleteTaskRequest = new EventEmitter<string>();
  isDeleteModalOpen = signal<boolean>(false);

  openDeleteTaskModal() {
    this.isDeleteModalOpen.update((prev) => !prev);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.update((prev) => !prev);
  }

  onDelete(): void {
    this.deleteTaskRequest.emit(this.task._id);
  }
}
