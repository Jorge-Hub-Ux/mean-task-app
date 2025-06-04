import { Component, inject, ViewChild } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task, TaskPriority, TaskStatus } from '../../shared/models/task.model';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { COMMA, ENTER } from '@angular/cdk/keycodes';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
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
    DatePipe,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  tasks: Task[] = [];
  dataSource = new MatTableDataSource<Task>();
  columnsToDisplay = [
    'title',
    'status',
    'priority',
    'dueDate',
    'tags',
    'actions',
  ];

  statuses = Object.values(TaskStatus);
  priorities = Object.values(TaskPriority);

  filters = {
    status: '',
    priority: '',
    tags: [] as string[],
  };

  allTags: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Forms
  form: FormGroup;
  isEditing = false;
  editingTaskId: string | null = null;

  constructor(private tasksService: TasksService, private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['Pending', Validators.required],
      priority: ['Medium'],
      dueDate: ['', Validators.required],
      tags: this.fb.array([]),
    });
  }

  get tags(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  addTag(tagInput: HTMLInputElement) {
    const value = tagInput.value.trim();
    if (value && !this.tags.value.includes(value)) {
      this.tags.push(new FormControl(value));
    }
    tagInput.value = '';
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  startCreateTask() {
    this.form.reset({ status: 'Pending', priority: 'Medium' });
    this.tags.clear();
    this.isEditing = false;
    this.editingTaskId = null;
  }

  editTask(task: Task) {
    this.form.patchValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: new Date(task.dueDate).toISOString().substring(0, 10),
    });
    this.tags.clear();
    task.tags?.forEach((tag) => this.tags.push(new FormControl(tag)));
    this.isEditing = true;
    this.editingTaskId = task._id!;
  }

  submitForm() {
    if (this.form.invalid) return;

    const taskData: Task = {
      ...this.form.value,
      tags: this.tags.value,
      dueDate: new Date(this.form.value.dueDate),
    };

    if (this.isEditing && this.editingTaskId) {
      this.tasksService
        .updateTask(this.editingTaskId, taskData)
        .subscribe(() => {
          this.loadTasks();
          this.form.reset();
          this.isEditing = false;
        });
    } else {
      this.tasksService.createTask(taskData).subscribe(() => {
        this.loadTasks();
        this.form.reset();
      });
    }
  }

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  addTagFromEvent(event: MatChipInputEvent): void {
    const input = event.chipInput?.inputElement;
    const value = event.value.trim();

    if (value && !this.tags.value.includes(value)) {
      this.tags.push(new FormControl(value));
    }

    if (input) {
      input.value = '';
    }
  }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.tasksService.getTasks().subscribe({
      next: (res) => {
        this.tasks = res.data;

        // Extraer etiquetas únicas
        const allTagsSet = new Set<string>();
        res.data.forEach((task) =>
          task.tags?.forEach((tag) => allTagsSet.add(tag))
        );
        this.allTags = Array.from(allTagsSet);

        // Aplicar todos los filtros
        const filtered = this.filterTasks(res.data);
        this.dataSource = new MatTableDataSource(filtered);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => console.error(err),
    });
  }

  clearTagFilters() {
    this.filters.tags = [];
    this.loadTasks();
  }

  toggleTagFilter(tag: string) {
    const index = this.filters.tags.indexOf(tag);
    if (index >= 0) {
      this.filters.tags.splice(index, 1);
    } else {
      this.filters.tags.push(tag);
    }
    this.loadTasks();
  }

  filterTasks(tasks: Task[]): Task[] {
    return tasks.filter(
      (task) =>
        (!this.filters.status || task.status === this.filters.status) &&
        (!this.filters.priority || task.priority === this.filters.priority) &&
        (this.filters.tags.length === 0 ||
          this.filters.tags.every((tag) => task.tags?.includes(tag))) &&
        (!this.searchTerm || task.title.toLowerCase().includes(this.searchTerm))
    );
  }

  // applyFilter(event: Event) {
  //   const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
  //   this.dataSource.filter = value;
  //   this.dataSource.filterPredicate = (task: Task, filter: string) =>
  //     task.title.toLowerCase().includes(filter);
  // }

  searchTerm = '';

  applyFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.loadTasks(); // Esto aplicará todos los filtros juntos
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
