import React, { useState, useMemo } from 'react';
import { WorkoutPlan } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon, PencilIcon, PlusCircleIcon } from './Icons';

interface AgendaProps {
  plans: WorkoutPlan[];
  onAddOrUpdatePlan: (plan: WorkoutPlan) => void;
  onDeletePlan: (planId: number) => void;
}

const Agenda: React.FC<AgendaProps> = ({ plans, onAddOrUpdatePlan, onDeletePlan }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  const workoutsByDate = useMemo(() => {
    const map = new Map<string, WorkoutPlan[]>();
    plans.forEach(plan => {
      const dateStr = plan.date.split('T')[0];
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(plan);
    });
    return map;
  }, [plans]);

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const openPlanModal = (plan: WorkoutPlan | null) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };
  
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`pad-start-${i}`} className="p-2"></div>);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayPlans = workoutsByDate.get(dateStr);
      const isCompleted = dayPlans?.some(p => p.status === 'completed');
      const isPlanned = dayPlans?.some(p => p.status === 'planned');
      const isSelected = selectedDate?.toISOString().split('T')[0] === dateStr;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div key={day} className="p-1">
          <button 
            onClick={() => setSelectedDate(date)}
            className={`w-full aspect-square rounded-full flex items-center justify-center text-sm transition-colors duration-200 relative
              ${isSelected ? 'bg-[rgb(var(--accent-color))] text-[var(--accent-text-color)] font-bold' 
              : isToday ? 'bg-gray-300/50 dark:bg-zinc-600/50' 
              : 'hover:bg-gray-200/70 dark:hover:bg-zinc-700/70'}`}
          >
            {day}
            {isPlanned && <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full border-2 ${isSelected ? 'border-[var(--accent-text-color)]' : 'border-[rgb(var(--accent-color))]'}`}></span>}
            {isCompleted && <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-[var(--accent-text-color)]' : 'bg-[rgb(var(--accent-color))]'}`}></span>}
          </button>
        </div>
      );
    }
    return days;
  };

  const selectedDayPlans = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return workoutsByDate.get(dateStr) || [];
  }, [selectedDate, workoutsByDate]);

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  return (
    <div className="text-gray-800 dark:text-gray-200">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200/70 dark:hover:bg-zinc-700/70" aria-label="Mês anterior">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h3 className="font-semibold text-lg">
          {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
        </h3>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200/70 dark:hover:bg-zinc-700/70" aria-label="Próximo mês">
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <div key={i}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7">{renderCalendar()}</div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">
            {selectedDate ? `Treinos de ${selectedDate.toLocaleDateString('pt-BR')}` : 'Selecione uma data'}
            </h4>
            {selectedDate && (
                <button onClick={() => openPlanModal(null)} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-[rgb(var(--accent-color))]">
                    <PlusCircleIcon className="w-6 h-6" />
                </button>
            )}
        </div>
        {selectedDate && (
          selectedDayPlans.length > 0 ? (
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {selectedDayPlans.map(plan => (
                <li key={plan.id} className={`p-3 rounded-lg text-sm flex justify-between items-center ${plan.status === 'completed' ? 'bg-green-500/10' : 'bg-black/5 dark:bg-white/5'}`}>
                  <div>
                    <p className={`font-semibold ${plan.status === 'completed' ? 'line-through' : ''}`}>{plan.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {plan.sets} séries | {formatTime(plan.exerciseTime)} / {formatTime(plan.restTime)}
                    </p>
                  </div>
                  {plan.status === 'planned' && (
                    <div className="flex items-center space-x-1">
                        <button onClick={() => openPlanModal(plan)} className="p-1 text-gray-500 hover:text-[rgb(var(--accent-color))]"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => onDeletePlan(plan.id)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum treino para esta data. Adicione um!</p>
          )
        )}
      </div>

      {isModalOpen && (
        <PlanModal 
            plan={editingPlan}
            selectedDate={selectedDate}
            onClose={() => setIsModalOpen(false)}
            onSave={onAddOrUpdatePlan}
        />
      )}
    </div>
  );
};

interface PlanModalProps {
    plan: WorkoutPlan | null;
    selectedDate: Date;
    onClose: () => void;
    onSave: (plan: WorkoutPlan) => void;
}

const PlanModal: React.FC<PlanModalProps> = ({ plan, selectedDate, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: plan?.name || 'Novo Treino',
        exerciseTime: plan?.exerciseTime || 30,
        restTime: plan?.restTime || 10,
        sets: plan?.sets || 8,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'name' ? value : Number(value) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalDuration = (formData.exerciseTime * formData.sets) + (formData.restTime * (formData.sets - 1));
        const finalPlan: WorkoutPlan = {
            id: plan?.id || Date.now(),
            date: selectedDate.toISOString().split('T')[0],
            name: formData.name,
            exerciseTime: formData.exerciseTime,
            restTime: formData.restTime,
            sets: formData.sets,
            totalDuration: totalDuration > 0 ? totalDuration : 0,
            status: 'planned',
        };
        onSave(finalPlan);
        onClose();
    };

    const baseInputClass = "w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">{plan ? 'Editar Plano' : 'Adicionar Plano'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="plan-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Treino</label>
                        <input id="plan-name" name="name" type="text" value={formData.name} onChange={handleChange} className={baseInputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="plan-exerciseTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exercício (s)</label>
                            <input id="plan-exerciseTime" name="exerciseTime" type="number" min="1" value={formData.exerciseTime} onChange={handleChange} className={baseInputClass} />
                        </div>
                        <div>
                            <label htmlFor="plan-restTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descanso (s)</label>
                            <input id="plan-restTime" name="restTime" type="number" min="0" value={formData.restTime} onChange={handleChange} className={baseInputClass} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="plan-sets" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Séries</label>
                        <input id="plan-sets" name="sets" type="number" min="1" value={formData.sets} onChange={handleChange} className={baseInputClass} />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-[rgb(var(--accent-color))] text-[var(--accent-text-color)] font-semibold rounded-lg hover:opacity-90">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Agenda;