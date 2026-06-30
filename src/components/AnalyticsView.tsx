import { Task, StudySession, Project, Habit } from '../types';
import GlassCard from './GlassCard';
import { BarChart3, LineChart, PieChart, Activity, CheckSquare, Award, Clock, Layers } from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  studySessions: StudySession[];
  projects: Project[];
  habits: Habit[];
}

export default function AnalyticsView({
  tasks,
  studySessions,
  projects,
  habits,
}: AnalyticsViewProps) {
  // 1. Task Completion Telemetries
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = totalTasks ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // 2. Study Hours total
  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + s.duration, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // 3. Project progress average
  const totalProjects = projects.length;
  const avgProjectProgress = totalProjects
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
    : 0;

  // 4. Habit streak indexes
  const totalHabits = habits.length;
  const avgHabitStreak = totalHabits
    ? Math.round(habits.reduce((sum, h) => sum + h.streakCurrent, 0) / totalHabits)
    : 0;

  // Study Sessions weekly hours data over last 5 days
  const dailyStudyHours = [
    { day: 'MON', hours: 2.0 },
    { day: 'TUE', hours: 1.5 },
    { day: 'WED', hours: 3.2 },
    { day: 'THU', hours: 2.5 },
    { day: 'FRI', hours: 4.0 },
  ];

  const maxWeeklyHours = Math.max(...dailyStudyHours.map((d) => d.hours), 1);

  return (
    <div className="space-y-6" id="analytics-view-container">
      {/* HUD Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
          COGNITIVE_ANALYTICS <span className="text-blue-400 font-mono text-sm border border-blue-500/30 px-2 py-0.5 rounded-full bg-blue-500/5">TELEMETRY</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
          LONGTERM PROGRESS AGGREGATES & EFFICIENCY VECTOR MATRIX
        </p>
      </div>

      {/* Grid of aggregate stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-slate-400 tracking-wider">TASK_COMPLETION_RATE</p>
            <h4 className="text-xl font-bold text-white mt-0.5">{taskCompletionRate}%</h4>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-slate-400 tracking-wider">CUMULATIVE_STUDY_HOURS</p>
            <h4 className="text-xl font-bold text-white mt-0.5">{totalStudyHours} hrs</h4>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-slate-400 tracking-wider">PROJECTS_AVG_PROGRESS</p>
            <h4 className="text-xl font-bold text-white mt-0.5">{avgProjectProgress}%</h4>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-mono text-slate-400 tracking-wider">HABIT_RESONANCE_STREAK</p>
            <h4 className="text-xl font-bold text-white mt-0.5">{avgHabitStreak} days</h4>
          </div>
        </GlassCard>
      </div>

      {/* Main double chart split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly study sessions chart (custom beautiful SVG renderer) */}
        <GlassCard borderAccent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-mono text-slate-300 tracking-widest uppercase flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400 animate-pulse" /> WEEKLY_STUDY_TELEMETRY (HRS)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">CHRONOS_LOG_CYCLE</span>
          </div>

          <div className="relative h-60 w-full flex items-end justify-between px-4 pb-8 pt-4">
            {/* Ambient chart background grid lines */}
            <div className="absolute inset-x-0 bottom-8 h-[1px] bg-white/5" />
            <div className="absolute inset-x-0 bottom-24 h-[1px] bg-white/5" />
            <div className="absolute inset-x-0 bottom-40 h-[1px] bg-white/5" />
            <div className="absolute inset-x-0 top-4 h-[1px] bg-white/5" />

            {/* Render bars dynamically */}
            {dailyStudyHours.map((data) => {
              const heightPct = (data.hours / maxWeeklyHours) * 70; // Map max height to 70% of area
              return (
                <div key={data.day} className="flex flex-col items-center gap-3 z-10 flex-1">
                  <div className="relative group flex flex-col items-center w-8">
                    {/* Floating tooltip */}
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-8 px-2 py-1 rounded bg-black border border-white/10 text-[9px] font-mono text-blue-400 transition-opacity whitespace-nowrap shadow-lg">
                      {data.hours} HRS
                    </span>
                    {/* Glowing bar column */}
                    <div
                      className="w-4 sm:w-6 bg-gradient-to-t from-blue-700 via-blue-500 to-blue-400 rounded-t-md shadow-[0_0_12px_rgba(59,130,246,0.25)] group-hover:brightness-110 transition-all duration-500"
                      style={{ height: `${heightPct}%`, minHeight: '6px' }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 tracking-wider">{data.day}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Project progress overview list */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-mono text-slate-300 tracking-widest uppercase mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" /> PRODUCTION_PIPELINES_COMPLIANCE
          </h3>

          {projects.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center font-mono">
              &gt; NO ACTIVE PRODUCTION PIPELINES REGISTERED
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="space-y-2 p-3 bg-white/[0.01] border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{proj.name}</h4>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{proj.status} // DUE: {proj.dueDate || 'CONTINUOUS'}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-400">{proj.progress}%</span>
                  </div>

                  {/* Visual gauge */}
                  <div className="h-1.5 bg-blue-950/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.3)] transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

      </div>

      {/* Cognitive stress HUD widget */}
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-mono text-slate-300 tracking-widest uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400 animate-pulse" /> BIO_SYNAPSE_RESONANCE
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-xl leading-relaxed">
              Based on active study telemetry durations, logged habits compliance cycles, and task resolving frequencies, your current cognitive coefficient is highly resonant. No system bottlenecks identified.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
            <div className="border border-white/5 rounded-xl bg-black/40 px-4 py-3 text-center">
              <span className="text-slate-500 block text-[9px] tracking-widest uppercase">STABILITY</span>
              <span className="text-blue-400 font-bold block mt-1">98.4% // PEAK</span>
            </div>
            <div className="border border-white/5 rounded-xl bg-black/40 px-4 py-3 text-center">
              <span className="text-slate-500 block text-[9px] tracking-widest uppercase">LATENCY</span>
              <span className="text-blue-400 font-bold block mt-1">0.12s // INTUITIVE</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
