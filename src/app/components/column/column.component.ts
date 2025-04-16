import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Column, Task } from '../../services/board/board.service';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TaskComponent } from '../task/task.component';

@Component({
  selector: 'app-column',
  imports: [CommonModule, DragDropModule, TaskComponent, ReactiveFormsModule],
  template: `
    <div class="flex-shrink-0 w-80 rounded-lg bg-gray-50 p-2 shadow-md">
      <div class="p-4 flex justify-between font-bold">
        <h3 class="text-gray-700">{{ column.name }}</h3>
        <button
          (click)="onDeleteColumn()"
          class="text-gray-700: hover:text-red-500 transition-colors duration-300 cursor-pointer"
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
      <div
        cdkDropList
        [id]="column._id"
        [cdkDropListData]="tasks"
        (cdkDropListDropped)="drop($event)"
        class="p-2"
      >
        <app-task
          *ngFor="let task of tasks"
          [task]="task"
          cdkDrag
          [cdkDragData]="task"
          (deleteTaskRequest)="onDeleteTask($event)"
        ></app-task>
      </div>
      <button
        (click)="openAddTaskModal()"
        class="w-full font-semibold flex items-center gap-2 hover:bg-gray-200 transition-all duration-300 px-6 text-gray-700 py-2 rounded-lg cursor-pointer"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add task
      </button>
      <!-- add task modal -->
      <div
        *ngIf="isAddTaskModalOpen()"
        class="fixed inset-0 bg-black/50 flex justify-center items-center"
      >
        <div class="w-full max-w-md bg-white rounded-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Create new task</h2>
          <form [formGroup]="taskForm" (ngSubmit)="onCreateTask()">
            <div class="mb-4">
              <label
                for="taskTitle"
                class="block text-gray-700 font-medium mb-2"
                >Title</label
              >
              <input
                type="text"
                id="taskTitle"
                formControlName="taskTitle"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-none focus:outline-none"
                [class.border-red-500]="
                  taskForm.get('taskTitle')?.invalid &&
                  (taskForm.get('taskTitle')?.dirty ||
                    taskForm.get('taskTitle')?.touched)
                "
              />
              <div
                *ngIf="taskForm.get('taskTitle')?.invalid || errorMessage()"
                class="text-red-500 text-sm mt-1"
              >
                <span
                  *ngIf="
                    taskForm.get('taskTitle')?.invalid &&
                    (taskForm.get('taskTitle')?.dirty ||
                      taskForm.get('taskTitle')?.touched)
                  "
                  >Task title is required</span
                >
                <span *ngIf="errorMessage()">{{ errorMessage() }}</span>
              </div>
            </div>
            <div class="mb-4">
              <label
                for="description"
                class="block text-gray-700 font-medium mb-2"
                >Description</label
              >
              <input
                type="text"
                id="description"
                formControlName="description"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-none focus:outline-none"
              />
            </div>
            <div class="flex justify-end gap-4">
              <button
                type="button"
                (click)="closeAddTaskModal()"
                class="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class ColumnComponent {
  @Input({ required: true }) column!: Column;
  @Input({ required: true }) tasks!: Task[];

  @Output() deleteColumnRequest = new EventEmitter<string>();
  @Output() createTaskRequest = new EventEmitter<{
    columnId: string;
    title: string;
    description: string;
  }>();
  @Output() deleteTaskRequest = new EventEmitter<string>();
  @Output() tasksDropped = new EventEmitter<CdkDragDrop<Task[]>>();

  isAddTaskModalOpen = signal<boolean>(false);
  errorMessage = signal<string>('');
  taskForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      taskTitle: ['', [Validators.required]],
      description: [''],
    });
  }

  openAddTaskModal(): void {
    this.isAddTaskModalOpen.update((prev) => !prev);
  }

  closeAddTaskModal(): void {
    this.isAddTaskModalOpen.update((prev) => !prev);
    this.taskForm.reset();
  }

  onDeleteColumn(): void {
    this.deleteColumnRequest.emit(this.column._id);
  }

  onCreateTask(): void {
    this.taskForm.markAllAsTouched();
    if (this.taskForm.valid) {
      this.createTaskRequest.emit({
        columnId: this.column._id,
        title: this.taskForm.get('taskTitle')?.value,
        description: this.taskForm.get('description')?.value,
      });
      this.taskForm.reset();
    }
  }

  onDeleteTask(taskId: string): void {
    this.deleteTaskRequest.emit(taskId);
  }

  drop(event: CdkDragDrop<Task[]>): void {
    this.tasksDropped.emit(event);
  }
}
