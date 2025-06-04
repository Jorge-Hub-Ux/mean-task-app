import { Component, inject, ViewChild } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task, TaskPriority, TaskStatus } from '../../shared/models/task.model';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    DatePipe
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})

export class TasksComponent {

  tasks: Task[] = [];
  dataSource = new MatTableDataSource<Task>();
  columnsToDisplay = ['title', 'status', 'priority', 'dueDate', 'tags', 'actions'];

  statuses = Object.values(TaskStatus);
  priorities = Object.values(TaskPriority);

  filters = {
    status: '',
    priority: ''
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private tasksService: TasksService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.tasksService.getTasks().subscribe({
      next: (res) => {
        console.log("res from get all", res);
        this.tasks = res.data;
        this.dataSource = new MatTableDataSource(this.filterTasks(res.data));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => console.error(err),
    });
  }

  filterTasks(tasks: Task[]): Task[] {
    return tasks.filter(task =>
      (!this.filters.status || task.status === this.filters.status) &&
      (!this.filters.priority || task.priority === this.filters.priority)
    );
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = value;
    this.dataSource.filterPredicate = (task: Task, filter: string) =>
      task.title.toLowerCase().includes(filter);
  }

  editTask(task: Task) {
    console.log('Editar tarea', task);
    // Lógica para mostrar formulario (expandible o modal)
  }

  confirmDelete(task: Task) {
    if (confirm(`¿Deseas eliminar la tarea "${task.title}"?`)) {
      this.tasksService.deleteTask(task._id!).subscribe(() => {
        this.loadTasks();
      });
    }
  }

  viewHistory(task: Task) {
    console.log('Ver historial', task);
    // Mostrar historial si está disponible
  }



  // ngOnInit(): void {
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
  // }

  // getAllTasks(): void {
  //   this.tasksService.getTasks().subscribe({
  //     next: (tasks) => {
  //       this.tasks = tasks;
  //       console.log('Tasks:', tasks);
  //     },
  //     error: (err) => console.error('Error:', err),
  //   });
  // }

  // getTaskById(): void {
  //   const id = '683fce36fea133a5f80ba457';
  //   this.tasksService.getTaskById(id).subscribe({
  //     next: (task) => console.log('Task by ID:', task),
  //     error: (err) => console.error('Error:', err),
  //   });
  // }

  // updateTask(): void {
  //   const id = '683fce36fea133a5f80ba457';
  //   this.tasksService
  //     .updateTask(id, { status: TaskStatus.IN_PROGESS })
  //     .subscribe({
  //       next: (updated) => console.log('Updated:', updated),
  //       error: (err) => console.error('Error:', err),
  //     });
  // }

  // deleteTask(): void {
  //   const id = '683fd55e089cc982be057dce';
  //   this.tasksService.deleteTask(id).subscribe({
  //     next: (res) => console.log('Deleted successfully: ', res),
  //     error: (err) => console.error('Error:', err),
  //   });
  // }

  // createTask(): void {
  //   const task: Task = {
  //     title: 'Implementar pruebas unitarias',
  //     description: 'Agregar pruebas con Jasmine para el componente tasks',
  //     status: TaskStatus.PENDING,
  //     dueDate: new Date(Date.now() + 86400000),
  //     priority: TaskPriority.HIGH,
  //     tags: ['testing', 'angular'],
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   };

  //   this.tasksService.createTask(task).subscribe({
  //     next: (res) => console.log('Created:', res),
  //     error: (err) => console.error('Error:', err),
  //   });
  // }

}
