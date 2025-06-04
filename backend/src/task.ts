import * as mongodb from 'mongodb';

// This file defines the Task interface and related enums for task management in a project.
export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGESS = 'In Progress',
  COMPLETED = 'Completed',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface TaskHistoryEntry {
  changedAt: Date;
  changes: string[];
}

export interface Task {
  _id?: mongodb.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate: Date;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  history?: TaskHistoryEntry[];
}
