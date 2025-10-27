import React, { useState, useEffect, useRef, useCallback } from 'react';

// Durations in seconds for different modes
const POMODORO_DURATION = 25 * 60;
const SHORT_BREAK_DURATION = 5 * 60;
const LONG_BREAK_DURATION = 15 * 60;

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface PomodoroTimerProps {
  onAlarm: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onAlarm }) => {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

  const handleModeChange = useCallback((newMode: Mode) => {
    if (isActive) {
      if (!window.confirm("O temporizador está ativo. Deseja realmente trocar? Isso irá reiniciar o tempo.")) {
        return;
      }
    }
    setIsActive(false);
    setMode(newMode);
    switch (newMode) {
      case 'pomodoro':
        setTimeRemaining(POMODORO_DURATION);
        break;
      case 'shortBreak':
        setTimeRemaining(SHORT_BREAK_DURATION);
        break;
      case 'longBreak':
        setTimeRemaining(LONG_BREAK_DURATION);
        break;
    }
  }, [isActive]);
  
  // The main timer logic
  useEffect(() => {
    // Fix: In browser environments, setInterval returns a number, not a NodeJS.Timeout.
    let interval: number | null = null;

    if (isActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      onAlarm();
      setIsActive(false);

      if (mode === 'pomodoro') {
        const newCompletedCount = pomodorosCompleted + 1;
        setPomodorosCompleted(newCompletedCount);
        // Automatically switch to the next appropriate break
        setMode(newCompletedCount % 4 === 0 ? 'longBreak' : 'shortBreak');
        setTimeRemaining(newCompletedCount % 4 === 0 ? LONG_BREAK_DURATION : SHORT_BREAK_DURATION);

      } else { // It was a break
        setMode('pomodoro');
        setTimeRemaining(POMODORO_DURATION);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining, mode, pomodorosCompleted, onAlarm]);

  // Update document title with remaining time
  useEffect(() => {
    if (!isActive) {
        if(document.title !== 'Evolução') {
           document.title = 'Evolução';
        }
        return;
    }
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.title = `${formattedTime} - Foco`;
    
    return () => {
        document.title = 'Evolução';
    }
  }, [timeRemaining, isActive]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };
  
  const handleReset = useCallback(() => {
    if (window.confirm("Deseja reiniciar o temporizador para a fase atual?")) {
      setIsActive(false);
      switch (mode) {
        case 'pomodoro': setTimeRemaining(POMODORO_DURATION); break;
        case 'shortBreak': setTimeRemaining(SHORT_BREAK_DURATION); break;
        case 'longBreak': setTimeRemaining(LONG_BREAK_DURATION); break;
      }
    }
  }, [mode]);

  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  const modeStyles = {
    pomodoro: 'bg-[rgb(var(--accent-color))] hover:opacity-90 focus:ring-[rgb(var(--accent-color))]',
    shortBreak: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
    longBreak: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
  };
  
  const activeModeButtonClass = "bg-[rgb(var(--accent-color))] text-[var(--accent-text-color)]";
  const inactiveModeButtonClass = "bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200";

  return (
    <div className="text-center">
      <div className="flex justify-center space-x-2 mb-6">
        <button onClick={() => handleModeChange('pomodoro')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${mode === 'pomodoro' ? activeModeButtonClass : inactiveModeButtonClass}`}>Pomodoro</button>
        <button onClick={() => handleModeChange('shortBreak')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${mode === 'shortBreak' ? activeModeButtonClass : inactiveModeButtonClass}`}>Pausa Curta</button>
        <button onClick={() => handleModeChange('longBreak')} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${mode === 'longBreak' ? activeModeButtonClass : inactiveModeButtonClass}`}>Pausa Longa</button>
      </div>

      <div className="text-7xl sm:text-8xl font-bold text-black dark:text-white mb-6 tracking-wider">
        {formatTime(timeRemaining)}
      </div>

      <div className="flex justify-center space-x-4">
        <button onClick={handleStartPause} className={`w-36 px-6 py-3 text-xl font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 transition-all transform hover:scale-105 ${modeStyles[mode]} ${mode === 'pomodoro' ? 'text-[var(--accent-text-color)]' : 'text-white'}`}>
          {isActive ? 'Pausar' : 'Iniciar'}
        </button>
        <button onClick={handleReset} className="px-4 py-2 bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-400">
          Reiniciar
        </button>
      </div>
      
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Pomodoros concluídos: {pomodorosCompleted}</p>
    </div>
  );
};

export default PomodoroTimer;