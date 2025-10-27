import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { WorkoutSettings, WorkoutPlan } from '../types';

type Phase = 'configuring' | 'exercise' | 'rest' | 'finished';
type SoundKey = 'bell' | 'beep' | 'alarm_clock' | 'siren' | 'buzzer';

const SOUNDS: Record<SoundKey, { name: string; url: string }> = {
  bell: { name: 'Sino', url: 'https://actions.google.com/sounds/v1/alarms/bell_timer.ogg' },
  beep: { name: 'Bipe Curto', url: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
  alarm_clock: { name: 'Alarme Padrão', url: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
  siren: { name: 'Sirene', url: 'https://actions.google.com/sounds/v1/alarms/digital_alarm_clock.ogg' },
  buzzer: { name: 'Buzzer', url: 'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg' },
};

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
const audioBuffers = new Map<SoundKey, AudioBuffer>();
let soundsLoaded = false;

async function loadSounds() {
  if (soundsLoaded) return;
  const promises = Object.entries(SOUNDS).map(async ([key, { url }]) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBuffers.set(key as SoundKey, audioBuffer);
    } catch (e) {
      console.error(`Failed to load sound: ${key}`, e);
    }
  });
  await Promise.all(promises);
  soundsLoaded = true;
}

interface WorkoutTimerProps {
  settings: WorkoutSettings;
  onSettingsChange: (newSettings: WorkoutSettings) => void;
  onWorkoutComplete: (session: Omit<WorkoutPlan, 'id' | 'date' | 'status'>) => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ settings, onSettingsChange, onWorkoutComplete }) => {
  const [workoutName, setWorkoutName] = useState('Meu Treino');
  const [exerciseTime, setExerciseTime] = useState(30);
  const [restTime, setRestTime] = useState(10);
  const [sets, setSets] = useState(8);
  
  const [isLoadingSounds, setIsLoadingSounds] = useState(true);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [phase, setPhase] = useState<Phase>('configuring');
  const [isActive, setIsActive] = useState(false);
  
  const restAlarmIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    loadSounds().then(() => setIsLoadingSounds(false));
  }, []);

  const playSound = useCallback((soundKey: SoundKey) => {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const buffer = audioBuffers.get(soundKey);
    if (buffer) {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    }
  }, []);
  
  const totalWorkoutTime = useMemo(() => {
    if (sets <= 0 || exerciseTime <= 0) return 0;
    const total = (exerciseTime * sets) + (restTime * (sets - 1));
    return total > 0 ? total : 0;
  }, [exerciseTime, restTime, sets]);

  useEffect(() => {
    let interval: number | null = null;

    if (isActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      if (restAlarmIntervalRef.current) clearInterval(restAlarmIntervalRef.current);

      if (phase === 'exercise') {
        if (currentSet < sets) {
          let repeatCount = 0;
          restAlarmIntervalRef.current = window.setInterval(() => {
            playSound(settings.restSound as SoundKey);
            repeatCount++;
            if (repeatCount >= 3) {
                if(restAlarmIntervalRef.current) clearInterval(restAlarmIntervalRef.current);
            }
          }, 1000);

          setPhase('rest');
          setTimeRemaining(restTime);
          setCurrentSet(prev => prev + 1);
        } else {
          playSound(settings.alarmSound as SoundKey);
          setPhase('finished');
          setIsActive(false);
          onWorkoutComplete({ name: workoutName, totalDuration: totalWorkoutTime, sets, exerciseTime, restTime });
        }
      } else if (phase === 'rest') {
        playSound('beep');
        setPhase('exercise');
        setTimeRemaining(exerciseTime);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, phase, currentSet, sets, exerciseTime, restTime, playSound, settings, onWorkoutComplete, totalWorkoutTime, workoutName]);
  
  const handleStart = () => {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    if (exerciseTime > 0 && sets > 0 && workoutName.trim()) {
      setPhase('exercise');
      setCurrentSet(1);
      setTimeRemaining(exerciseTime);
      setIsActive(true);
      playSound('beep');
    } else {
      alert("Por favor, preencha o nome do treino, tempo de exercício e séries.")
    }
  };

  const handlePause = () => {
    setIsActive(prev => !prev);
    if (restAlarmIntervalRef.current) clearInterval(restAlarmIntervalRef.current);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('configuring');
    setCurrentSet(1);
    setTimeRemaining(0);
    if (restAlarmIntervalRef.current) clearInterval(restAlarmIntervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const phaseText = {
    configuring: 'Configure seu Treino',
    exercise: `${workoutName} - Série ${currentSet}/${sets}`,
    rest: `Descanso - Série ${currentSet-1}/${sets}`,
    finished: 'Treino Concluído!',
  }[phase];

  const phaseColorClass = {
    configuring: 'bg-gray-200 dark:bg-zinc-700',
    exercise: 'bg-green-500/20 text-green-800 dark:text-green-300',
    rest: 'bg-blue-500/20 text-blue-800 dark:text-blue-300',
    finished: 'bg-amber-500/20 text-amber-800 dark:text-amber-300',
  }[phase];
  
  const baseSelectClass = "w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-color))] text-sm";
  const baseInputClass = "w-full px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100";

  return (
    <div className="text-center">
      {phase === 'configuring' ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="workout-name" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Treino</label>
            <input id="workout-name" type="text" value={workoutName} onChange={e => setWorkoutName(e.target.value)} className={baseInputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="exercise-time" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exercício (s)</label>
                <input id="exercise-time" type="number" min="1" value={exerciseTime} onChange={e => setExerciseTime(Number(e.target.value))} className={baseInputClass} />
            </div>
            <div>
                <label htmlFor="rest-time" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descanso (s)</label>
                <input id="rest-time" type="number" min="0" value={restTime} onChange={e => setRestTime(Number(e.target.value))} className={baseInputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="sets" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Séries</label>
            <input id="sets" type="number" min="1" value={sets} onChange={e => setSets(Number(e.target.value))} className={baseInputClass} />
          </div>
          <div className="border-t border-gray-200/50 dark:border-zinc-700/50 my-4"></div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="rest-sound-select" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alerta de Descanso</label>
                    <select id="rest-sound-select" value={settings.restSound} onChange={e => onSettingsChange({ ...settings, restSound: e.target.value })} className={baseSelectClass}>
                        {Object.entries(SOUNDS).filter(([k]) => k !== 'beep').map(([key, { name }]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="alarm-sound-select" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alerta Final</label>
                    <select id="alarm-sound-select" value={settings.alarmSound} onChange={e => onSettingsChange({ ...settings, alarmSound: e.target.value })} className={baseSelectClass}>
                        {Object.entries(SOUNDS).filter(([k]) => k !== 'beep').map(([key, { name }]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
            </div>

          <div className="text-center pt-4 text-gray-600 dark:text-gray-400">
            <p>Duração total: <span className="font-bold">{formatTime(totalWorkoutTime)}</span></p>
          </div>
        </div>
      ) : (
        <>
            <div className={`mb-4 p-2 rounded-md font-semibold text-lg ${phaseColorClass}`}>
                {phaseText}
            </div>
            <div className="text-7xl font-bold text-black dark:text-white mb-6">
                {formatTime(timeRemaining)}
            </div>
        </>
      )}

      <div className="flex justify-center space-x-4 mt-4">
        {phase === 'configuring' && (
           <button onClick={handleStart} disabled={isLoadingSounds} className="w-full px-6 py-3 text-xl font-semibold rounded-lg bg-[rgb(var(--accent-color))] text-[var(--accent-text-color)] disabled:opacity-50">
             {isLoadingSounds ? 'Carregando sons...' : 'Iniciar Treino'}
           </button>
        )}
        {phase !== 'configuring' && (
            <>
                <button onClick={handlePause} className="w-36 px-6 py-3 text-xl font-semibold rounded-lg bg-[rgb(var(--accent-color))] text-[var(--accent-text-color)]">
                    {isActive ? 'Pausar' : 'Continuar'}
                </button>
                <button onClick={handleReset} className="px-4 py-2 bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-500">
                    Reiniciar
                </button>
            </>
        )}
      </div>
    </div>
  );
};

export default WorkoutTimer;