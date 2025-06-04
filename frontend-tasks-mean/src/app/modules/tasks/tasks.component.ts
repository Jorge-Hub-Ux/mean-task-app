import { Component, inject } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task, TaskPriority, TaskStatus } from '../../shared/models/task.model';

@Component({
  selector: 'app-tasks',
  imports: [],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  private readonly tasksService = inject(TasksService);
  tasks: Task[] = [];

  ngOnInit(): void {
    // // GET ALL
    // this.tasksService.getTasks().subscribe({
    //   next: (tasks) => console.log('Tasks:', tasks),
    //   error: (err) => console.error('Error:', err),
    // });
    // // GET ALL BY ID
    // this.tasksService.getTaskById('683fce36fea133a5f80ba457').subscribe({
    //   next: (task) => console.log('Task by ID:', task),
    //   error: (err) => console.error('Error:', err),
    // });
    // // PUT TASK
    // this.tasksService.updateTask('683fce36fea133a5f80ba457', { status: TaskStatus.IN_PROGESS }).subscribe({
    //   next: (updated) => console.log('Updated:', updated),
    //   error: (err) => console.error('Error:', err),
    // });
    // // DELETE TASK
    // this.tasksService.deleteTask('ID_AQUI').subscribe({
    //   next: () => console.log('Deleted successfully'),
    //   error: (err) => console.error('Error:', err),
    // });
    // // POST TASK
    // const task: Task = {
    //   title: 'Implementar pruebas unitarias',
    //   description: 'Agregar pruebas con Jasmine para el componente tasks',
    //   status: TaskStatus.PENDING,
    //   dueDate: new Date(Date.now() + 86400000),
    //   priority: TaskPriority.HIGH,
    //   tags: ['testing', 'angular'],
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // };
    // this.tasksService.createTask(task).subscribe({
    //   next: (res) => console.log('Created:', res),
    //   error: (err) => console.error('Error:', err),
    // });
  }

  getAllTasks(): void {
    this.tasksService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        console.log('Tasks:', tasks);
      },
      error: (err) => console.error('Error:', err),
    });
  }

  getTaskById(): void {
    const id = '683fce36fea133a5f80ba457';
    this.tasksService.getTaskById(id).subscribe({
      next: (task) => console.log('Task by ID:', task),
      error: (err) => console.error('Error:', err),
    });
  }

  updateTask(): void {
    const id = '683fce36fea133a5f80ba457';
    this.tasksService
      .updateTask(id, { status: TaskStatus.IN_PROGESS })
      .subscribe({
        next: (updated) => console.log('Updated:', updated),
        error: (err) => console.error('Error:', err),
      });
  }

  deleteTask(): void {
    const id = '683fd55e089cc982be057dce';
    this.tasksService.deleteTask(id).subscribe({
      next: (res) => console.log('Deleted successfully: ', res),
      error: (err) => console.error('Error:', err),
    });
  }

  createTask(): void {
    const task: Task = {
      title: 'Implementar pruebas unitarias',
      description: 'Agregar pruebas con Jasmine para el componente tasks',
      status: TaskStatus.PENDING,
      dueDate: new Date(Date.now() + 86400000),
      priority: TaskPriority.HIGH,
      tags: ['testing', 'angular'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasksService.createTask(task).subscribe({
      next: (res) => console.log('Created:', res),
      error: (err) => console.error('Error:', err),
    });
  }
}
