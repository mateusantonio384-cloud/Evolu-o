import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onClearCompleted: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDeleteTask, onClearCompleted }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-600 dark:text-gray-400">Nenhuma tarefa encontrada. Adicione uma nova!</p>
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const completedTasksCount = tasks.filter(task => task.completed).length;

  return (
    <div>
      <ul className="space-y-3">
        {sortedTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </ul>
      {completedTasksCount > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={onClearCompleted}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 rounded-lg hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors"
          >
            Limpar {completedTasksCount} tarefa(s) concluída(s)
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskList;