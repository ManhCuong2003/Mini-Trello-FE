import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../services/board/board.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task',
  imports: [CommonModule],
  template: `
    <div class="bg-white p-4 rounded-lg shadow mb-3 cursor-move hover:shadow-md transition-shadow duration-200">
      <div class="flex items-center justify-between">
        <h4>{{ task.title }}</h4>
        <button (click)="onDelete()" class="text-gray-400 hover:text-red-500">
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
      <p *ngIf="task.description" class="text-sm text-gray-600 mt-2">{{ task.description }}</p>
    </div>
  `,
  styles: ``,
})
export class TaskComponent {
  @Input({ required: true }) task!: Task;
  @Output() deleteTaskRequest = new EventEmitter<string>();

  onDelete(): void {
    this.deleteTaskRequest.emit(this.task._id);
  }
}
