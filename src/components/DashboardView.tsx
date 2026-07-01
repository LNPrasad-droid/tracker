import React, { useState, useEffect } from 'react';
import { Task, StudySession, Project, Habit } from '../types';
import GlassCard from './GlassCard';
import { CheckSquare, BookOpen, Layers, Award, Calendar, FileText, ArrowRight, Activity, Sparkles, Trash2 } from 'lucide-react';

interface DashboardViewProps {
  tasks: Task[];
  studySessions: StudySession[];
  projects: Project[];
  habits: Habit[];
  quickNote: string;
  onNavigate: (tab: string) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateQuickNote: (quickNote: string) => void;
}

export default function DashboardView({
  tasks,
  studySessions,
  projects,
  habits,
  quickNote,
  onNavigate,
  onToggleTask,
  onUpdateQuickNote,
}: DashboardViewProps) {
  const [draftQuickNote, setDraftQuickNote] = useState(quickNote);

  useEffect(() => {
    setDraftQuickNote(quickNote);
  }, [quickNote]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (draftQuickNote !== quickNote) {
        onUpdateQuickNote(draftQuickNote);
      }
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [draftQuickNote, onUpdateQuickNote, quickNote]);

  const handleQuickNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftQuickNote(e.target.value);
  };

  const handleClearQuickNote = () => {
    setDraftQuickNote('');
    onUpdateQuickNote('');
  };

  // Get current date representation
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculated telemetry metrics
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || !t.dueDate);
  const completedTodayTasks = todayTasks.filter((t) => t.completed);
  
  const todayStudyMinutes = studySessions
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + s.duration, 0);
  const todayStudyHours = (todayStudyMinutes / 60).toFixed(1);

  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;

  const totalHabitsCount = habits.length;
  const activeStreak = habits.reduce((max, h) => Math.max(max, h.streakCurrent), 0);

  const upcomingDeadlines = tasks
    .filter((t) => !t.completed && t.dueDate && t.dueDate >= todayStr)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 3);

  // Overall productivity rating formula
  const taskCompletionRate = tasks.length ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0;
  const habitCompletionRate = habits.length ? (habits.filter((h) => h.streakCurrent > 0).length / habits.length) * 100 : 0;
  const overallProductivity = Math.round((taskCompletionRate * 0.4) + (habitCompletionRate * 0.3) + (Math.min(100, (todayStudyMinutes / 240) * 100) * 0.3));

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* Top Banner Area with HUD Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            SYSTEM CONTROL <span className="text-blue-400 font-mono text-sm border border-blue-500/30 px-2 py-0.5 rounded-full bg-blue-500/5">ONLINE</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
            COGNITIVE LOAD: {overallProductivity}% OF PEAK CAPACITY
          </p>
        </div>
        
        {/* Ambient Time/System clock display */}
        <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-xl px-4 py-2 font-mono text-xs text-blue-400">
          <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>ORBITAL_CYCLE_ACTIVE</span>
        </div>
      </div>

      {/* Grid Layout of Bento Telemetry Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: Today's Tasks */}
        <GlassCard hoverGlow onClick={() => onNavigate('tasks')} className="p-5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 tracking-wider">01 // TODAY_TASKS</span>
            <CheckSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-white font-sans">
              {completedTodayTasks.length} <span className="text-slate-500 text-lg">/ {todayTasks.length}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Tasks completed today</p>
          </div>
          <div className="flex items-center text-[10px] text-blue-400 font-mono mt-2 group-hover:translate-x-1 transition-transform">
            OPEN MANAGER <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </GlassCard>

        {/* Widget 2: Study Hours */}
        <GlassCard hoverGlow onClick={() => onNavigate('study')} className="p-5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 tracking-wider">02 // STUDY_TELEMETRY</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-white font-sans">
              {todayStudyHours} <span className="text-slate-500 text-lg">HRS</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Focused study logged today</p>
          </div>
          <div className="flex items-center text-[10px] text-blue-400 font-mono mt-2">
            OPEN TRACKER <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </GlassCard>

        {/* Widget 3: Active Projects */}
        <GlassCard hoverGlow onClick={() => onNavigate('projects')} className="p-5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 tracking-wider">03 // ACTIVE_PROJECTS</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-white font-sans">
              {activeProjectsCount} <span className="text-slate-500 text-lg">INITIATIVES</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Underactive project pipelines</p>
          </div>
          <div className="flex items-center text-[10px] text-blue-400 font-mono mt-2">
            OPEN PROJECTS <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </GlassCard>

        {/* Widget 4: Habit Streaks */}
        <GlassCard hoverGlow onClick={() => onNavigate('habits')} className="p-5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 tracking-wider">04 // HABIT_FLOWS</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-white font-sans">
              {activeStreak} <span className="text-slate-500 text-lg">DAYS</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Current longest running streak</p>
          </div>
          <div className="flex items-center text-[10px] text-blue-400 font-mono mt-2">
            OPEN HABITS <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </GlassCard>
      </div>

      {/* Main Split Section: Secondary Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Primary Status HUD */}
        <div className="lg:col-span-2 space-y-6">
          {/* Animated Productivity Overview & Core Telemetry circle */}
          <GlassCard borderAccent className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-sm font-mono text-slate-300 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin duration-3000" /> SYSTEM_EFFICIENCY_METRIC
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG circular track */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - overallProductivity / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-white font-sans">{overallProductivity}%</span>
                  <span className="text-[9px] text-blue-400 font-mono uppercase tracking-widest mt-0.5">SYNAPSE_RATE</span>
                </div>
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">TASK_ENGINE_STABILITY</span>
                    <span className="text-white">{Math.round(taskCompletionRate)}%</span>
                  </div>
                  <div className="h-1.5 bg-blue-950/40 border border-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${taskCompletionRate}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">HABIT_RESONANCE_INDEX</span>
                    <span className="text-white">{Math.round(habitCompletionRate)}%</span>
                  </div>
                  <div className="h-1.5 bg-blue-950/40 border border-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: `${habitCompletionRate}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">STUDY_FOCAL_INTENSITY</span>
                    <span className="text-white">{Math.min(100, Math.round((todayStudyMinutes / 240) * 100))}%</span>
                  </div>
                  <div className="h-1.5 bg-blue-950/40 border border-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, (todayStudyMinutes / 240) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Today's Focus Tasks Mini-list */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-mono text-slate-300 tracking-widest uppercase mb-4">
              FOCUS_PIPELINES_TODAY ({todayTasks.length})
            </h3>
            {todayTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center font-mono uppercase tracking-wider">
                &gt; NO ACTIVE FOCUS PIPELINES LOGGED FOR TODAY
              </p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleTask(task.id)}
                        className="w-4 h-4 rounded border-white/10 text-blue-500 focus:ring-0 focus:ring-offset-0 bg-transparent cursor-pointer"
                      />
                      <div>
                        <span className={`text-xs font-medium text-white ${task.completed ? 'line-through text-slate-500' : ''}`}>
                          {task.title}
                        </span>
                        {task.category && (
                          <span className="ml-2 px-1.5 py-0.5 text-[8px] font-mono rounded bg-white/5 text-slate-400 uppercase tracking-widest">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.priority === 'critical' && (
                      <span className="px-1.5 py-0.5 text-[8px] font-mono rounded border border-rose-500/20 bg-rose-500/10 text-rose-400 uppercase tracking-wider animate-pulse">
                        CRITICAL
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Column 3: Side panels (Deadlines & Quick Notes) */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-mono text-slate-300 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> UPCOMING_CHRONO_GATES
            </h3>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center font-mono">
                &gt; NO UPCOMING CHRONO GATES DETECTED
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((t) => (
                  <div key={t.id} className="border-l-2 border-blue-500/40 pl-3 py-1">
                    <p className="text-xs font-medium text-white truncate">{t.title}</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-400">
                      <span>DUE: {t.dueDate}</span>
                      <span className="uppercase text-blue-400">{t.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Quick Notes Area */}
          <GlassCard className="p-5 flex flex-col min-h-72 border-blue-500/20 bg-slate-950/70">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
                    <FileText className="w-4 h-4 text-blue-300" />
                  </span>
                  Quick Notes
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">Private notes synced through Leo OS.</p>
              </div>
              {draftQuickNote && (
                <button
                  onClick={handleClearQuickNote}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-slate-500 transition-colors hover:border-red-400/30 hover:text-red-300 cursor-pointer"
                  title="Clear note"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <textarea
              className="quick-note-scrollbar w-full flex-1 resize-none rounded-2xl border border-blue-400/20 bg-slate-950/80 p-4 text-sm leading-6 text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-blue-300/50 focus:ring-4 focus:ring-blue-500/10"
              placeholder="Write a quick note, formula, idea, or reminder..."
              value={draftQuickNote}
              onChange={handleQuickNoteChange}
            />
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500">
              <span>{draftQuickNote.length} characters</span>
              <span className="text-blue-300/70">Synced to MySQL</span>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
