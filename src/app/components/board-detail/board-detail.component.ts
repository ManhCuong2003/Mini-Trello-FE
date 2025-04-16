import { Component, computed, OnInit, signal } from '@angular/core';
import {
  BoardData,
  BoardService,
  Task,
} from '../../services/board/board.service';
import { HeaderComponent } from '../header/header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnService } from '../../services/column/column.service';
import { MoveTaskPayload, TaskService } from '../../services/task/task.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ColumnComponent } from '../column/column.component';
import {
  CdkDragDrop,
  CdkDropListGroup,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    ReactiveFormsModule,
    ColumnComponent,
    DragDropModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col">
      <app-header />
      <div class="flex-1 flex flex-col">
        <div class="flex items-center justify-between p-6">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ boardData()?.board?.name }}
          </h2>
          <button
            (click)="openCreateColumnModal()"
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
            Create New Column
          </button>
        </div>
        <div
          *ngIf="isLoading()"
          class="flex-1 flex items-center justify-center"
        >
          <h1 class="text-2xl font-semibold">Loading...</h1>
        </div>
        <div
          *ngIf="boardData()?.columns?.length === 0 && isLoading() === false"
          class="flex-1 flex justify-center items-center"
        >
          <div class="flex flex-col items-center">
            <h2 class="text-xl font-semibold text-gray-800 mb-2">
              No Columns Yet
            </h2>
            <p class="text-gray-600 mb-4">Create your first column!</p>
            <button
              (click)="openCreateColumnModal()"
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
              Create New Column
            </button>
          </div>
        </div>
        <div
          *ngIf="boardData()?.columns?.length! > 0 && isLoading() === false"
          class="flex-1 flex gap-6 px-6 overflow-x-auto"
          cdkDropListGroup
        >
          <div *ngFor="let column of boardData()?.columns">
            <app-column
              [column]="column"
              [tasks]="getTasksForColumn(column._id)"
              (deleteColumnRequest)="deleteColumn($event)"
              (createTaskRequest)="createTask($event)"
              (deleteTaskRequest)="deleteTask($event)"
              (tasksDropped)="drop($event, column._id)"
            ></app-column>
          </div>
        </div>
      </div>
      <!-- create column modal -->
      <div
        *ngIf="isCreateColumnModalOpen()"
        class="fixed inset-0 bg-black/50 flex justify-center items-center"
      >
        <div class="w-full max-w-md bg-white rounded-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">
            Create new column
          </h2>
          <form [formGroup]="columnForm" (ngSubmit)="createColumn()">
            <div class="mb-4">
              <label
                for="columnName"
                class="block text-gray-700 font-semibold mb-2"
                >Column name</label
              >
              <input
                id="columnName"
                placeholder="Enter column name"
                type="text"
                formControlName="columnName"
                class="w-full border border-gray-300 px-4 py-2 rounded-lg placeholder:text-gray-400 focus:ring-blue-500 focus:ring-2 focus:border-none focus:outline-none"
                [class.border-red-500]="
                  columnForm.get('columnName')?.invalid &&
                  (columnForm.get('columnName')?.dirty ||
                    columnForm.get('columnName')?.touched)
                "
              />
              <div
                *ngIf="columnForm.get('columnName')?.invalid || errorMessage()"
                class="text-red-500 text-sm mt-1"
              >
                <span
                  *ngIf="
                    columnForm.get('columnName')?.invalid &&
                    (columnForm.get('columnName')?.dirty ||
                      columnForm.get('columnName')?.touched)
                  "
                  >Column name is required</span
                >
                <span *ngIf="errorMessage()">{{ errorMessage() }}</span>
              </div>
            </div>
            <div class="flex justify-end gap-4">
              <button
                type="button"
                (click)="closeCreateColumnModal()"
                class="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Create column
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class BoardDetailComponent implements OnInit {
  boardId = signal<string>('');
  boardData = signal<BoardData | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  columnForm: FormGroup;
  isCreateColumnModalOpen = signal<boolean>(false);

  sortedColumns = computed(() => {
    const data = this.boardData();
    if (!data || !data.board.columnOrder) {
      return [];
    }
    const columnMap = new Map(data.columns.map((col) => [col._id, col]));
    return data.board.columnOrder
      .map((colId) => columnMap.get(colId))
      .filter((col) => col !== undefined);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private columnService: ColumnService,
    private taskService: TaskService,
    private fb: FormBuilder
  ) {
    this.columnForm = this.fb.group({
      columnName: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('boardId');
    if (id) {
      this.boardId.set(id);
      this.loadBoardData();
    } else {
      this.errorMessage.set('Không tìm thấy ID của bảng.');
      this.isLoading.update((prev) => !prev);
    }
  }

  loadBoardData(): void {
    this.errorMessage.set('');
    this.boardService.getBoardData(this.boardId()).subscribe({
      next: (data) => {
        this.boardData.set(data);
        this.isLoading.update((prev) => !prev);
      },
      error: (error) => {
        console.error('Error fetching board data:', error);
        if (error.status === 404) {
          this.errorMessage.set(
            'Board not exist or you do not have permission to access.'
          );
        } else {
          this.errorMessage.set('Failed to load board data.');
        }
        this.isLoading.update((prev) => !prev);
      },
    });
  }

  openCreateColumnModal(): void {
    this.isCreateColumnModalOpen.update((prev) => !prev);
  }

  closeCreateColumnModal(): void {
    this.isCreateColumnModalOpen.update((prev) => !prev);
    this.columnForm.reset();
  }

  createColumn(): void {
    const name: string = this.columnForm.get('columnName')?.value;
    if (!name.trim()) {
      return;
    }
    this.errorMessage.set('');
    this.columnService.createColumn(this.boardId(), name).subscribe({
      next: (newColumn) => {
        this.boardData.update((currentData) => {
          if (!currentData) {
            return null;
          }
          return {
            ...currentData,
            columns: [...currentData.columns, newColumn],
            board: {
              ...currentData.board,
              columnOrder: [...currentData.board.columnOrder, newColumn._id],
            },
          };
        });
        this.columnForm.reset();
        this.isCreateColumnModalOpen.update((prev) => !prev);
      },
      error: (err) => {
        console.error('Error creating column:', err);
        this.errorMessage.set(err.error?.message || 'Fail to create column.');
      },
    });
  }

  getTasksForColumn(columnId: string): Task[] {
    const data = this.boardData();
    if (!data) return [];

    const column = data.columns.find((col) => col._id === columnId);
    if (!column) return [];

    const taskMap = new Map(data.tasks.map((task) => [task._id, task]));

    return column.taskOrder
      .map((taskId) => taskMap.get(taskId))
      .filter((task): task is Task => task !== undefined);
  }

  deleteColumn(columnId: string): void {
    if (!this.boardData()) {
      return;
    }

    const columnName = this.boardData()?.columns.find(
      (col) => col._id === columnId
    )?.name;
    if (
      confirm(
        `Bạn có chắc muốn xóa "${columnName}" và tất cả các task bên trong nó?`
      )
    ) {
      this.errorMessage.set('');
      this.columnService.deleteColumn(columnId).subscribe({
        next: () => {
          this.boardData.update((currentData) => {
            if (!currentData) {
              return null;
            }
            return {
              ...currentData,
              columns: currentData.columns.filter(
                (col) => col._id !== columnId
              ),
              tasks: currentData.tasks.filter(
                (task) => task.column !== columnId
              ),
              board: {
                ...currentData.board,
                columnOrder: currentData.board.columnOrder.filter(
                  (colId) => colId !== columnId
                ),
              },
            };
          });
        },
        error: (err) => {
          console.error('Error deleting column:', err);
          this.errorMessage.set(err.error?.message || 'Fail to delete column.');
        },
      });
    }
  }

  createTask(event: { columnId: string; title: string, description: string }) {
    this.errorMessage.set('');
    this.taskService.createTask(event.columnId, event.title, event.description).subscribe({
      next: (newTask) => {
        this.boardData.update((currentData) => {
          if (!currentData) {
            return null;
          }
          const updatedTasks = [...currentData.tasks, newTask];
          const updatedColumns = currentData.columns.map((col) => {
            if (col._id === event.columnId) {
              return { ...col, taskOrder: [...col.taskOrder, newTask._id] };
            }
            return col;
          });
          return {
            ...currentData,
            columns: updatedColumns,
            tasks: updatedTasks,
          };
        });
      },
      error: (err) => {
        console.error('Error creating task:', err);
        this.errorMessage.set(err.error?.message || 'Fail to create new task.');
      },
    });
  }

  deleteTask(taskId: string): void {
    if (!this.boardData()) {
      return;
    }
    if (confirm('Are you sure to delete this task?')) {
      this.errorMessage.set('');
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.boardData.update((currentData) => {
            if (!currentData) {
              return null;
            }
            const taskToDelete = currentData.tasks.find(
              (task) => task._id === taskId
            );
            if (!taskToDelete) {
              return currentData;
            }
            const updatedTasks = currentData.tasks.filter(
              (task) => task._id !== taskId
            );
            const updatedColumns = currentData.columns.map((col) => {
              if (col._id === taskToDelete.column) {
                return {
                  ...col,
                  taskOrder: col.taskOrder.filter((id) => id !== taskId),
                };
              }
              return col;
            });
            return {
              ...currentData,
              tasks: updatedTasks,
              columns: updatedColumns,
            };
          });
        },
        error: (err) => {
          console.error('Error deleting task:', err);
          this.errorMessage.set(err.error?.message || 'Fail to delete task.');
        },
      });
    }
  }

  // drag & drop
  drop(event: CdkDragDrop<Task[]>, columnId: string): void {
    if (!this.boardData()) {
      return;
    }

    const previousContainerData = event.previousContainer.data;
    const containerData = event.container.data;
    const previousColumnId = event.previousContainer.id;
    const destColumnId = event.container.id;
    const taskToMove = event.item.data as Task;
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    // console.log('Drop Event:', {
    //     taskToMove: taskToMove.title,
    //     previousColumnId,
    //     destColumnId,
    //     previousIndex,
    //     currentIndex
    // });

    if (event.previousContainer === event.container) {
      moveItemInArray(containerData, previousIndex, currentIndex);
      this.updateColumnTaskOrderLocally(
        columnId,
        containerData.map((task) => task._id)
      );
    } else {
      transferArrayItem(
        previousContainerData,
        containerData,
        previousIndex,
        currentIndex
      );
      this.updateColumnTaskOrderLocally(
        previousColumnId,
        previousContainerData.map((task) => task._id)
      );
      this.updateColumnTaskOrderLocally(
        destColumnId,
        containerData.map((task) => task._id)
      );
      this.updateTaskColumnLocally(taskToMove._id, destColumnId);
    }

    const payload: MoveTaskPayload = {
      sourceColumnId: previousColumnId,
      destColumnId: destColumnId,
      sourceIndex: previousIndex,
      destIndex: currentIndex,
    };

    this.taskService.moveTask(taskToMove._id, payload).subscribe({
      next: (res) => {
        console.log('Task move successful on backend:', res.message);
      },
      error: (err) => {
        console.error('Error moving task on backend:', err);
        this.errorMessage.set('Move task error. Load data again...');
        this.loadBoardData();
      },
    });
  }

  private updateColumnTaskOrderLocally(
    columnId: string,
    newTaskOrderIds: string[]
  ) {
    this.boardData.update((currentData) => {
      if (!currentData) {
        return null;
      }
      const updatedColumns = currentData.columns.map((col) => {
        if (col._id === columnId) {
          return { ...col, taskOrder: newTaskOrderIds };
        }
        return col;
      });
      return { ...currentData, columns: updatedColumns };
    });
  }

  private updateTaskColumnLocally(taskId: string, newColumnId: string) {
    this.boardData.update((currentData) => {
      if (!currentData) {
        return null;
      }
      const updatedTasks = currentData.tasks.map((task) => {
        if (task._id === taskId) {
          return { ...task, column: newColumnId };
        }
        return task;
      });
      return { ...currentData, tasks: updatedTasks };
    });
  }
}
