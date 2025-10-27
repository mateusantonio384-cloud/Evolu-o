import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task, Habit, WorkoutSettings, WorkoutPlan } from './types';
import TaskList from './components/TaskList';
import PomodoroTimer from './components/PomodoroTimer';
import SettingsModal from './components/SettingsModal';
import HabitTracker from './components/HabitTracker';
import WorkoutTimer from './components/WorkoutTimer';
import Agenda from './components/Agenda';
import { DragHandleIcon, ChevronDownIcon } from './components/Icons';
import { ACCENT_COLORS, BACKGROUND_COLORS } from './constants';
import TaskForm from './components/TaskForm';

interface AppSettings {
  theme: 'light' | 'dark';
  accentColor: string;
  backgroundImage: string | null;
  backgroundColor: string;
}

type PanelKey = 'tasks' | 'pomodoro' | 'settings' | 'habits' | 'workout' | 'agenda';
type PanelColumn = 'main' | 'side';

const PANEL_TITLES: Record<PanelKey, string> = {
  tasks: 'Tarefas',
  pomodoro: 'Temporizador Pomodoro',
  settings: 'Configurações',
  habits: 'Hábitos',
  workout: 'Cronômetro de Academia',
  agenda: 'Agenda de Treinos',
};

interface PanelLayout {
  main: PanelKey[];
  side: PanelKey[];
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  accentColor: 'yellow',
  backgroundImage: null,
  backgroundColor: 'default',
};

const DEFAULT_WORKOUT_SETTINGS: WorkoutSettings = {
  alarmSound: 'alarm_clock',
  restSound: 'bell',
};

const DEFAULT_PANEL_LAYOUT: PanelLayout = {
  main: ['tasks', 'agenda'],
  side: ['pomodoro', 'habits', 'workout', 'settings'],
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [workoutSettings, setWorkoutSettings] = useState<WorkoutSettings>(DEFAULT_WORKOUT_SETTINGS);
  const [panelLayout, setPanelLayout] = useState<PanelLayout>(DEFAULT_PANEL_LAYOUT);
  const [expandedPanels, setExpandedPanels] = useState<Set<PanelKey>>(() => new Set(['tasks']));

  const draggedItem = useRef<{ panel: PanelKey; fromColumn: PanelColumn; fromIndex: number } | null>(null);
  const dragOverItem = useRef<{ toColumn: PanelColumn; toIndex: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const alarmSoundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
      const savedHabits = localStorage.getItem('habits');
      setHabits(savedHabits ? JSON.parse(savedHabits) : []);
      const savedPlans = localStorage.getItem('workoutPlans');
      setWorkoutPlans(savedPlans ? JSON.parse(savedPlans) : []);
      const savedLayout = localStorage.getItem('layout');
      setPanelLayout(savedLayout ? JSON.parse(savedLayout) : DEFAULT_PANEL_LAYOUT);
      const savedSettings = localStorage.getItem('settings');
      setSettings(savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS);
      const savedWorkoutSettings = localStorage.getItem('workoutSettings');
      setWorkoutSettings(savedWorkoutSettings ? JSON.parse(savedWorkoutSettings) : DEFAULT_WORKOUT_SETTINGS);
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('workoutPlans', JSON.stringify(workoutPlans));
  }, [workoutPlans]);

  useEffect(() => {
    localStorage.setItem('layout', JSON.stringify(panelLayout));
  }, [panelLayout]);

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem('settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
      alert("Não foi possível salvar a imagem. O arquivo pode ser muito grande (limite de ~5MB).");
    }
  }, []);

  const handleWorkoutSettingsChange = useCallback((newSettings: WorkoutSettings) => {
    localStorage.setItem('workoutSettings', JSON.stringify(newSettings));
    setWorkoutSettings(newSettings);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(settings.theme);
    const colorInfo = ACCENT_COLORS[settings.accentColor as keyof typeof ACCENT_COLORS] || ACCENT_COLORS.yellow;
    document.documentElement.style.setProperty('--accent-color', colorInfo.rgb);
    document.documentElement.style.setProperty('--accent-text-color', colorInfo.textColor);
  }, [settings]);

  // Combined alarm interval for habits and tasks
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const intervalId = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = now.toISOString().split('T')[0];
      
      // Habit alarms
      habits.forEach(habit => {
        if (habit.reminderTime === currentTime && habit.lastCompletedDate !== todayStr) {
          alarmSoundRef.current?.play();
          if (Notification.permission === 'granted') {
            new Notification('Lembrete de Hábito', {
              body: `É hora de completar seu hábito: ${habit.name}!`,
            });
          }
        }
      });
      
      // Task alarms
      tasks.forEach(task => {
        if (!task.completed && !task.alarmTriggered) {
          const dueDate = new Date(task.dueDate);
          if (now >= dueDate) {
            alarmSoundRef.current?.play();
            if (Notification.permission === 'granted') {
              new Notification('Lembrete de Tarefa', {
                body: `A tarefa "${task.title}" está vencida!`,
              });
            }
            // Mark alarm as triggered to avoid repetition
            setTasks(prevTasks => prevTasks.map(t => t.id === task.id ? { ...t, alarmTriggered: true } : t));
          }
        }
      });

    }, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [habits, tasks]);

  const handleAddTask = useCallback((title: string, dueDate: string) => {
    const newTask: Task = { id: Date.now(), title, dueDate, completed: false, alarmTriggered: false };
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, []);

  const handleToggleComplete = useCallback((id: number) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  }, []);

  const handleDeleteTask = useCallback((id: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);

  const handleClearCompletedTasks = useCallback(() => {
    const completedTasksCount = tasks.filter(t => t.completed).length;
    if (completedTasksCount > 0 && window.confirm(`Você tem certeza que deseja remover ${completedTasksCount} tarefa(s) concluída(s)? Esta ação não pode ser desfeita.`)) {
      setTasks(prevTasks => prevTasks.filter(task => !task.completed));
    }
  }, [tasks]);

  const handleAddHabit = useCallback((name: string, reminderTime: string) => {
    const newHabit: Habit = { id: Date.now(), name, reminderTime, streak: 0, lastCompletedDate: null };
    setHabits(prev => [...prev, newHabit]);
  }, []);

  const handleCompleteHabit = useCallback((id: number) => {
    setHabits(prevHabits => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      return prevHabits.map(habit => {
        if (habit.id === id) {
          if (habit.lastCompletedDate === todayStr) return habit;
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const newStreak = habit.lastCompletedDate === yesterdayStr ? habit.streak + 1 : 1;
          return { ...habit, streak: newStreak, lastCompletedDate: todayStr };
        }
        return habit;
      });
    });
  }, []);

  const handleDeleteHabit = useCallback((id: number) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  const handleCompleteWorkout = useCallback((session: Omit<WorkoutPlan, 'id' | 'date' | 'status'>) => {
    const newPlan: WorkoutPlan = {
      ...session,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    };
    setWorkoutPlans(prev => [...prev, newPlan]);
  }, []);

  const handleAddOrUpdatePlan = useCallback((plan: WorkoutPlan) => {
    setWorkoutPlans(prev => {
      const existingIndex = prev.findIndex(p => p.id === plan.id);
      if (existingIndex > -1) {
        const newPlans = [...prev];
        newPlans[existingIndex] = plan;
        return newPlans;
      }
      return [...prev, plan];
    });
  }, []);

  const handleDeletePlan = useCallback((planId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este plano de treino?")) {
      setWorkoutPlans(prev => prev.filter(p => p.id !== planId));
    }
  }, []);

  const handleDragStart = (panel: PanelKey, fromColumn: PanelColumn, fromIndex: number) => {
    draggedItem.current = { panel, fromColumn, fromIndex };
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragEnter = (toColumn: PanelColumn, toIndex: number) => {
    if (draggedItem.current) dragOverItem.current = { toColumn, toIndex };
  };

  const handleDragEnd = () => {
    if (!draggedItem.current || !dragOverItem.current) {
      setIsDragging(false);
      return;
    }
    const { panel, fromColumn, fromIndex } = draggedItem.current;
    const { toColumn, toIndex } = dragOverItem.current;
    if (fromColumn === toColumn && fromIndex === toIndex) {
      setIsDragging(false);
      draggedItem.current = null;
      dragOverItem.current = null;
      return;
    }
    const newLayout = JSON.parse(JSON.stringify(panelLayout));
    newLayout[fromColumn].splice(fromIndex, 1);
    newLayout[toColumn].splice(toIndex, 0, panel);
    setPanelLayout(newLayout);
    draggedItem.current = null;
    dragOverItem.current = null;
    setIsDragging(false);
  };

  const handleTogglePanel = useCallback((panelKey: PanelKey) => {
    setExpandedPanels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(panelKey)) newSet.delete(panelKey);
      else newSet.add(panelKey);
      return newSet;
    });
  }, []);

  const playAlarm = useCallback(() => {
    alarmSoundRef.current?.play();
  }, []);

  const appStyle: React.CSSProperties = settings.backgroundImage ? {
    backgroundImage: `url(${settings.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  } : {};

  const renderPanel = (panelKey: PanelKey, column: PanelColumn, index: number) => {
    const isBeingDragged = isDragging && draggedItem.current?.panel === panelKey;
    const isExpanded = expandedPanels.has(panelKey);
    const content = {
      tasks: (
        <>
          <div className="p-6"><h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Nova Tarefa</h2><TaskForm onAddTask={handleAddTask} /></div>
          <div className="px-6 pb-6"><TaskList tasks={tasks} onToggleComplete={handleToggleComplete} onDeleteTask={handleDeleteTask} onClearCompleted={handleClearCompletedTasks} /></div>
        </>
      ),
      pomodoro: <div className="p-6"><PomodoroTimer onAlarm={playAlarm} /></div>,
      settings: <div className="p-6"><SettingsModal settings={settings} onSettingsChange={handleSettingsChange} /></div>,
      habits: <div className="p-6"><HabitTracker habits={habits} onAddHabit={handleAddHabit} onCompleteHabit={handleCompleteHabit} onDeleteHabit={handleDeleteHabit} /></div>,
      workout: <div className="p-6"><WorkoutTimer settings={workoutSettings} onSettingsChange={handleWorkoutSettingsChange} onWorkoutComplete={handleCompleteWorkout} /></div>,
      agenda: <div className="p-6"><Agenda plans={workoutPlans} onAddOrUpdatePlan={handleAddOrUpdatePlan} onDeletePlan={handleDeletePlan} /></div>,
    }[panelKey];

    return (
      <div
        key={panelKey}
        onDragEnter={(e) => { e.stopPropagation(); handleDragEnter(column, index) }}
        onDragOver={(e) => e.preventDefault()}
        className={`bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 dark:border-zinc-700/50 transition-all duration-300 ${isBeingDragged ? 'opacity-30' : ''}`}
      >
        <div className="flex items-center p-4 border-b border-gray-200/50 dark:border-zinc-700/50">
          <div
            draggable
            onDragStart={() => handleDragStart(panelKey, column, index)}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1"
            aria-label={`Arrastar painel ${PANEL_TITLES[panelKey]}`}
          >
            <DragHandleIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
          </div>
          <button
            onClick={() => handleTogglePanel(panelKey)}
            className="flex items-center justify-between w-full ml-2 text-left"
            aria-expanded={isExpanded}
            aria-controls={`panel-content-${panelKey}`}
          >
            <h2 className="text-lg font-semibold text-black dark:text-white">{PANEL_TITLES[panelKey]}</h2>
            <ChevronDownIcon className={`h-6 w-6 text-gray-500 dark:text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <div
          id={`panel-content-${panelKey}`}
          className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px]' : 'max-h-0'}`}
        >
          {content}
        </div>
      </div>
    );
  }

  const DropZone: React.FC<{ onDragEnter: () => void }> = ({ onDragEnter }) => (
    <div
      onDragEnter={onDragEnter}
      onDragOver={e => e.preventDefault()}
      className="h-32 w-full border-2 border-dashed border-gray-400/50 dark:border-zinc-600/50 rounded-xl flex items-center justify-center text-gray-500 dark:text-zinc-500"
    >
      Mova um painel aqui
    </div>
  );

  const bgColorClass = settings.backgroundImage
    ? ''
    : (BACKGROUND_COLORS[settings.backgroundColor]?.className || BACKGROUND_COLORS.default.className);

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${bgColorClass}`}
      style={appStyle}
    >
      <div className={`max-w-7xl mx-auto`}>
        <header className="flex justify-between items-center mb-6">
          <h1 className={`text-4xl sm:text-5xl font-bold ${settings.backgroundImage ? 'text-white drop-shadow-lg' : 'text-black dark:text-white'}`}>Evolução</h1>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-2 flex flex-col gap-6">
                {panelLayout.main.map((panelKey, index) => renderPanel(panelKey, 'main', index))}
                {isDragging && panelLayout.main.length === 0 && <DropZone onDragEnter={() => handleDragEnter('main', 0)} />}
            </div>

            <div className="lg:col-span-1 flex flex-col gap-6">
                {panelLayout.side.map((panelKey, index) => renderPanel(panelKey, 'side', index))}
                {isDragging && panelLayout.side.length === 0 && <DropZone onDragEnter={() => handleDragEnter('side', 0)} />}
            </div>
        </main>
      </div>
      <audio ref={alarmSoundRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" preload="auto"></audio>
    </div>
  );
};

export default App;