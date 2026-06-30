import React, { useState } from 'react';
import { Habit, HabitLog } from '../types';
import GlassCard from './GlassCard';
import { Award, Plus, Flame, Check, Sparkles, Trash2, Calendar } from 'lucide-react';

interface HabitTrackerViewProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streakCurrent' | 'streakMax'>) => void;
  onToggleHabitLog: (habitId: string, date: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

export default function HabitTrackerView({
  habits,
  habitLogs,
  onAddHabit,
  onToggleHabitLog,
  onDeleteHabit,
}: HabitTrackerViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  // Generate date strings for the last 7 days (including today) to show completion status grid
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    onAddHabit({
      name: habitName.trim(),
      frequency,
    });

    setHabitName('');
    setFrequency('daily');
    setShowAddForm(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6" id="habit-tracker-container">
      {/* HUD Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            HABIT_RESONATOR <span className="text-blue-400 font-mono text-sm border border-blue-500/30 px-2 py-0.5 rounded-full bg-blue-500/5">LOCKS</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
            ESTABLISHING RHYTHM, MOMENTUM & RECURSIVE PATTERNS
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-medium rounded-xl transition-all shadow-[0_4px_20px_rgba(59,130,246,0.25)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'ABORT_LOCK' : 'INJECT_LOCK'}
        </button>
      </div>

      {/* Add Habit form */}
      {showAddForm && (
        <GlassCard borderAccent className="p-6">
          <h3 className="text-sm font-mono text-blue-400 tracking-widest uppercase mb-4 flex items-center gap-2">
            INJECT_RECURSIVE_HABIT_LOCK
          </h3>
          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Habit Action Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diaphragmatic breathing..."
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Recurrence Loop Rate</label>
                <div className="flex gap-2">
                  {(['daily', 'weekly'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`
                        flex-1 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest border transition-all
                        ${frequency === freq
                          ? 'bg-blue-500/20 border-blue-400 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                          : 'bg-transparent border-white/5 text-slate-400 hover:border-white/10'
                        }
                      `}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-white/5 rounded-xl hover:bg-white/5 text-slate-400 font-mono text-xs transition-colors"
              >
                ABORT
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                DEPLOY_LOOP_LOCK
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Habit Loops Grid View */}
      {habits.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
            &gt; NO RECURSIVE HABIT LOGS REGISTERED IN CHRONOS ENGINE
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const isCompletedToday = habitLogs.some(
              (log) => log.habitId === habit.id && log.date === todayStr && log.completed
            );

            return (
              <GlassCard
                key={habit.id}
                className="p-5 flex flex-col justify-between hover:bg-white/[0.01] transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase tracking-widest border border-blue-500/10">
                        {habit.frequency}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">INITIATED: {new Date(habit.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1.5">{habit.name}</h4>
                  </div>

                  <button
                    onClick={() => onToggleHabitLog(habit.id, todayStr)}
                    className={`
                      p-2 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-90
                      ${isCompletedToday
                        ? 'bg-blue-600/30 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        : 'bg-black/30 border-white/5 text-slate-500 hover:border-white/15 hover:text-slate-300'
                      }
                    `}
                    title="Toggle completion for today"
                  >
                    <Check className={`w-4 h-4 ${isCompletedToday ? 'stroke-[3px]' : ''}`} />
                  </button>
                </div>

                {/* 7-day completion grid visualizer */}
                <div className="mt-5 space-y-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">HISTORIC_7DAY_SYNC_FLOWS</span>
                  <div className="flex items-center justify-between gap-1.5">
                    {last7Days.map((date) => {
                      const log = habitLogs.find((l) => l.habitId === habit.id && l.date === date);
                      const isLogged = log?.completed;
                      const dateObj = new Date(date + 'T00:00:00');
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                      const isToday = date === todayStr;

                      return (
                        <div key={date} className="flex flex-col items-center gap-1 flex-1">
                          <button
                            onClick={() => onToggleHabitLog(habit.id, date)}
                            className={`
                              w-full h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer
                              ${isLogged
                                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                                : isToday
                                  ? 'bg-transparent border-blue-500/30 text-blue-400 border-dashed'
                                  : 'bg-black/40 border-white/5 text-slate-700 hover:border-white/10'
                              }
                            `}
                          >
                            {isLogged && <Check className="w-3 h-3" />}
                          </button>
                          <span className={`text-[8px] font-mono ${isToday ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>{dayName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Metrics (Streaks stats) */}
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs font-mono text-amber-500">
                      <Flame className="w-4 h-4 animate-pulse" />
                      <span>{habit.streakCurrent} STREAK</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <Award className="w-3.5 h-3.5 text-blue-400" />
                      <span>{habit.streakMax} MAX</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
