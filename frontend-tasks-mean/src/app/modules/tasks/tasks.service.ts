import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../../shared/models/task.model';
import { environment } from '../../../environment/environment.local';
import { API_CONFIG } from '../../core/data/api.data';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private http = inject(HttpClient);

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.apiUrl}/${API_CONFIG.TASKS.TASK}`);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${environment.apiUrl}/${API_CONFIG.TASKS.TASK}/${id}`);
  }

  createTask(task: Task): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${API_CONFIG.TASKS.TASK}/`, task);
  }

  updateTask(id: string, updates: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${environment.apiUrl}/${API_CONFIG.TASKS.TASK}/${id}`, updates);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/${API_CONFIG.TASKS.TASK}/${id}`);
  }


}
