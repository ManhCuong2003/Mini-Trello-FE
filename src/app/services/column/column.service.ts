import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { Column } from '../board/board.service';

@Injectable({
  providedIn: 'root',
})
export class ColumnService {
  private apiUrl = 'https://mini-trello-be.onrender.com/api/columns';
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
  }

  // Tạo column mới cho một board
  createColumn(boardId: string, name: string): Observable<Column> {
    const url = `${this.apiUrl}/boards/${boardId}/columns`;
    return this.http.post<Column>(
      url,
      { name },
      { headers: this.getAuthHeaders() }
    );
  }

  // Xóa column
  deleteColumn(columnId: string): Observable<{ message: string }> {
    const url = `${this.apiUrl}/${columnId}`;
    return this.http.delete<{ message: string }>(url, {
      headers: this.getAuthHeaders(),
    });
  }
}
