import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../../shared/models/task.model';
import { environment } from '../../../environment/environment.local';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private http = inject(HttpClient);

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.apiUrl}/`);
  }
}
