import React, { useState } from 'react';

interface TaskFormProps {
  onAddTask: (title: string, dueDate: string) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && dueDate) {
      onAddTask(title.trim(), dueDate);
      setTitle('');
      setDueDate('');
    } else {
      alert("Por favor, preencha o título e a data de vencimento.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="task-title" className="sr-only">Título da tarefa</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da tarefa"
          className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-color))]"
          required
        />
      </div>
      <div>
        <label htmlFor="task-due-date" className="sr-only">Data de vencimento</label>
        <input
          id="task-due-date"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-color))]"
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-[rgb(var(--accent-color))] text-[var(--accent-text-color)] font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-[rgb(var(--accent-color))]"
        >
          Adicionar Tarefa
        </button>
      </div>
    </form>
  );
};

export default TaskForm;