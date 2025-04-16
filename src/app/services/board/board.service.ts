import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

export interface Board {
  _id: string;
  name: string;
  owner: string;
  columnOrder: string[];
  createdAt: string;
  updatedAt: string;
}
export interface Column {
  _id: string;
  name: string;
  board: string;
  taskOrder: string[];
  createdAt: string;
  updatedAt: string;
}
export interface Task {
  _id: string;
  title: string;
  description?: string;
  board: string;
  column: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardData {
  board: Board;
  columns: Column[];
  tasks: Task[];
}

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private apiUrl = 'http://localhost:5000/api/boards';
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bear ${token}`,
    });
  }

  // lấy danh sách board của user
  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  // tạo board mới
  createBoard(name: string): Observable<Board> {
    return this.http.post<Board>(
      this.apiUrl,
      { name },
      { headers: this.getAuthHeaders() }
    );
  }

  // Lấy dữ liệu chi tiết của một board (board, columns, tasks)
  getBoardData(boardId: string): Observable<BoardData> {
    return this.http.get<BoardData>(`${this.apiUrl}/${boardId}/data`, {
      headers: this.getAuthHeaders(),
    });
  }

  // xóa board
  deleteBoard(boardId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${boardId}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
