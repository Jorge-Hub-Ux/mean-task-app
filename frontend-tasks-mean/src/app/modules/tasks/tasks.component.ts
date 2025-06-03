import { Component, inject } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task } from '../../shared/models/task.model';

@Component({
  selector: 'app-tasks',
  imports: [],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent {
  private readonly tasksService = inject(TasksService);
  tasks: Task[] = [];

  ngOnInit(): void {
    this.tasksService.getTasks().subscribe({
      next: (tasks) => (this.tasks = tasks),
      error: (err) => console.error('Error loading tasks:', err),
    });
  }
}
