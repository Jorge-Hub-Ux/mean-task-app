import { Component, inject, ViewChild } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task, TaskPriority, TaskStatus } from '../../shared/models/task.model';
import {
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { COMMA, ENTER } from '@angular/cdk/keycodes';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TaskHistoryComponent } from '../task-history/task-history.component';

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
    MatPaginatorModule,
    MatChipsModule,
    MatCardModule,
    ReactiveFormsModule,
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
  dialog = inject(MatDialog);

  // Forms
  isEditing = false;
  editingTaskId: string | null = null;

  constructor(private tasksService: TasksService) {}

  #formBuilder = inject(FormBuilder);
  form = this.#formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    status: [TaskStatus.PENDING, [Validators.required]],
    priority: [TaskPriority.MEDIUM],
    dueDate: ['', [Validators.required]],
    tags: this.#formBuilder.array([]),
  });

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
    this.form.reset({
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
    });
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

    if (this.form.value.dueDate == null || this.form.value.dueDate == undefined)
      return;

    const taskData: Task = {
      title: this.form.value.title ?? '',
      description: this.form.value.description ?? '',
      status: this.form.value.status ?? TaskStatus.PENDING,
      priority: this.form.value.priority ?? TaskPriority.MEDIUM,
      tags: this.tags.value,
      dueDate: new Date(this.form.value.dueDate ?? new Date()),
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

  confirmDelete(task: Task) {
    if (confirm(`¿Deseas eliminar la tarea "${task.title}"?`)) {
      this.tasksService.deleteTask(task._id!).subscribe(() => {
        this.loadTasks();
      });
    }
  }

  viewHistory(task: Task) {
    this.dialog.open(TaskHistoryComponent, {
      data: task,
      width: '400px',
    });
  }
}
