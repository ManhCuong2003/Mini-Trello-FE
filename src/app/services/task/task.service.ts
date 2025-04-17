import { Injectable } from '@angular/core';
import { Task } from '../board/board.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export interface MoveTaskPayload {
  sourceColumnId: string;
  destColumnId: string;
  sourceIndex: number;
  destIndex: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/api/tasks`;
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
  }

  // Tạo task mới trong một column
  createTask(columnId: string, title: string, description: string): Observable<Task> {
    const url = `${this.apiUrl}/columns/${columnId}/tasks`;
    return this.http.post<Task>(
      url,
      { title, description },
      { headers: this.getAuthHeaders() }
    );
  }

  // Xóa task
  deleteTask(taskId: string): Observable<{ message: string }> {
    const url = `${this.apiUrl}/${taskId}`;
    return this.http.delete<{ message: string }>(url, {
      headers: this.getAuthHeaders(),
    });
  }

  // Di chuyển task (Drag & Drop)
  moveTask(
    taskId: string,
    payload: MoveTaskPayload
  ): Observable<{ message: string }> {
    const url = `${this.apiUrl}/${taskId}/move`;
    return this.http.put<{ message: string }>(url, payload, {
      headers: this.getAuthHeaders(),
    });
  }
}
