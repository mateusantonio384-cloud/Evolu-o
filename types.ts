export interface Task {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Habit {
  id: number;
  name: string;
  reminderTime: string; // HH:MM
  streak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
}
