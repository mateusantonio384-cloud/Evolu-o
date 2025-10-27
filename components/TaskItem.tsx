import React from 'react';
import { Task } from '../types';
import { TrashIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onDeleteTask: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDeleteTask }) => {
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sem data de vencimento';
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      return `Vence em: ${date.toLocaleDateString('pt-BR', options).replace(',', ' às')}`;
    } catch (e) {
      return 'Data inválida';
    }
  };

  const isPastDue = !task.completed && new Date(task.dueDate) < new Date();

  return (
    <li className={`flex items-center p-4 bg-black/5 dark:bg-white/5 rounded-lg shadow-sm transition-all duration-300 border border-transparent hover:border-gray-300/50 dark:hover:border-zinc-600/50 ${task.completed ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        className="h-6 w-6 rounded border-gray-400 dark:border-zinc-500 text-[rgb(var(--accent-color))] focus:ring-[rgb(var(--accent-color))] cursor-pointer bg-transparent"
      />
      <div className="flex-1 ml-4">
        <p className={`text-lg font-medium text-gray-900 dark:text-gray-100 ${task.completed ? 'line-through' : ''}`}>
          {task.title}
        </p>
        <p className={`text-sm ${isPastDue ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
          {formatDate(task.dueDate)}
        </p>
      </div>
      <button
        onClick={() => onDeleteTask(task.id)}
        className="ml-4 p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--accent-color))]"
        aria-label="Excluir tarefa"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </li>
  );
};

export default TaskItem;