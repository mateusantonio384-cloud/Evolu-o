// FIX: Add User interface to be used by Auth component
export interface User {
  name: string;
}

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
  alarmTriggered?: boolean;
}

export interface Habit {
  id: number;
  name: string;
  reminderTime: string; // HH:MM
  streak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
}

export interface WorkoutSettings {
  alarmSound: string;
  restSound: string;
}

export interface WorkoutPlan {
  id: number;
  date: string; // YYYY-MM-DD
  name: string;
  totalDuration: number; // seconds
  sets: number;
  exerciseTime: number; // seconds
  restTime: number; // seconds
  status: 'planned' | 'completed';
}