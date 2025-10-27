import React, { useState } from 'react';
import { Habit } from '../types';
import { BellIcon, FlameIcon, TrashIcon } from './Icons';

interface HabitTrackerProps {
  habits: Habit[];
  onAddHabit: (name: string, reminderTime: string) => void;
  onCompleteHabit: (id: number) => void;
  onDeleteHabit: (id: number) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, onAddHabit, onCompleteHabit, onDeleteHabit }) => {
  const [name, setName] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && reminderTime) {
      onAddHabit(name.trim(), reminderTime);
      setName('');
      setReminderTime('');
    } else {
      alert("Por favor, preencha o nome e o horário do lembrete.");
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Novo Hábito</h3>
        <form onSubmit={handleSubmit} className="space-y-3 sm:flex sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Ler por 15 min"
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-color))]"
            required
          />
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-color))]"
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-[rgb(var(--accent-color))] text-[var(--accent-text-color)] font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-[rgb(var(--accent-color))]"
          >
            Adicionar
          </button>
        </form>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Seus Hábitos</h3>
        {habits.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Nenhum hábito adicionado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {habits.map(habit => {
              const isCompletedToday = habit.lastCompletedDate === todayStr;
              return (
                <li key={habit.id} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                  <button
                    onClick={() => onCompleteHabit(habit.id)}
                    className={`w-full text-left flex items-center group ${isCompletedToday ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 ${isCompletedToday ? 'bg-[rgb(var(--accent-color))] border-[rgb(var(--accent-color))]' : 'border-gray-400 group-hover:border-[rgb(var(--accent-color))]'} flex items-center justify-center transition-colors`}>
                      {isCompletedToday && <span className="text-[var(--accent-text-color)]">✔</span>}
                    </div>
                    <div className="ml-3 flex-1">
                        <p className={`font-medium text-gray-900 dark:text-gray-100 ${isCompletedToday ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                            {habit.name}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <BellIcon className="w-3 h-3 mr-1" />
                            <span>{habit.reminderTime}</span>
                        </div>
                    </div>
                  </button>
                  <div className="flex items-center space-x-2 ml-2">
                    <div className="flex items-center text-orange-500">
                        <FlameIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{habit.streak}</span>
                    </div>
                    <button
                        onClick={() => onDeleteHabit(habit.id)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-full"
                        aria-label="Excluir hábito"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;
