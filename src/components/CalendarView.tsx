import { useState } from 'react';
import { Task, StudySession, Project, HabitLog } from '../types';
import GlassCard from './GlassCard';
import { ChevronLeft, ChevronRight, Calendar, CheckSquare, BookOpen, Layers, Award } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  studySessions: StudySession[];
  projects: Project[];
  habitLogs: HabitLog[];
}

export default function CalendarView({
  tasks,
  studySessions,
  projects,
  habitLogs,
}: CalendarViewProps) {
  // Current visible month/year state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5)); // Default June 2026 (based on mock times)
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Handle month shifting
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Create standard calendar cells structure
  const blankCells = Array.from({ length: firstDayIndex }, (_, i) => null);
  const dayCells = Array.from({ length: totalDays }, (_, i) => i + 1);
  const allCells = [...blankCells, ...dayCells];

  // Month names array
  const MONTH_NAMES = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const getCellDateString = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Filter events for the selected day in detail side panel
  const getDayEvents = (dayStr: string) => {
    const dayTasks = tasks.filter((t) => t.dueDate === dayStr);
    const daySessions = studySessions.filter((s) => s.date === dayStr);
    const dayProjects = projects.filter((p) => p.dueDate === dayStr);
    const dayHabits = habitLogs.filter((l) => l.date === dayStr && l.completed);

    return { dayTasks, daySessions, dayProjects, dayHabits };
  };

  const activeEvents = selectedDayStr ? getDayEvents(selectedDayStr) : null;

  return (
    <div className="space-y-6" id="calendar-view-container">
      {/* HUD Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            CHRONO_MAP <span className="text-blue-400 font-mono text-sm border border-blue-500/30 px-2 py-0.5 rounded-full bg-blue-500/5">CALENDAR</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
            MAPPING TIMELINES, DIRECTIVES, STUDY TELEMETRIES, AND HABIT LOOPS
          </p>
        </div>

        {/* Date Selector Shift Controls */}
        <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-xl p-1.5 font-mono text-xs text-blue-400">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-bold tracking-widest px-2 min-w-36 text-center">
            {MONTH_NAMES[month]} {year}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: 7-Column Calendar Grid vs Right Detail Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Grid */}
        <div className="lg:col-span-2">
          <GlassCard borderAccent className="p-5">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                <span key={d} className="text-[10px] font-mono text-slate-500 font-semibold tracking-wider py-1">
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid Cells */}
            <div className="grid grid-cols-7 gap-2">
              {allCells.map((day, cellIdx) => {
                if (day === null) {
                  return <div key={`empty-${cellIdx}`} className="aspect-square bg-transparent rounded-xl" />;
                }

                const dayStr = getCellDateString(day);
                const isSelected = selectedDayStr === dayStr;
                const { dayTasks, daySessions, dayProjects, dayHabits } = getDayEvents(dayStr);
                const hasEvents = dayTasks.length > 0 || daySessions.length > 0 || dayProjects.length > 0 || dayHabits.length > 0;

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => setSelectedDayStr(dayStr)}
                    className={`
                      aspect-square rounded-xl p-2 relative flex flex-col justify-between items-start transition-all cursor-pointer border text-left
                      ${isSelected
                        ? 'bg-blue-500/10 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : isSelected === false && hasEvents
                          ? 'bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-200'
                          : 'bg-black/40 border-white/5 hover:border-white/10 text-slate-400'
                      }
                    `}
                  >
                    <span className="text-xs font-mono font-bold">{day}</span>

                    {/* Compact Event Indicators */}
                    {hasEvents && (
                      <div className="flex flex-wrap gap-1 mt-1 max-w-full">
                        {dayTasks.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`${dayTasks.length} tasks due`} />
                        )}
                        {daySessions.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title={`${daySessions.length} study sessions`} />
                        )}
                        {dayProjects.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" title={`${dayProjects.length} projects due`} />
                        )}
                        {dayHabits.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-300" title={`${dayHabits.length} habits completed`} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Selected Day Event Logs Panel */}
        <div className="space-y-4">
          <GlassCard className="p-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-mono text-slate-300 tracking-widest uppercase mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" /> DAY_CHRONO_DETAILS
              </h3>

              {!selectedDayStr ? (
                <p className="text-xs text-slate-500 text-center py-10 font-mono">
                  &gt; SELECT A DAY ON CHRONO MAP TO RESOLVE TELEMETRIES
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="font-mono text-xs font-bold text-blue-400 border-b border-white/5 pb-2">
                    &gt; LOGGING RUNS ON {selectedDayStr}
                  </div>

                  {activeEvents && (
                    <div className="space-y-4">
                      {/* Study Sessions detail */}
                      {activeEvents.daySessions.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest block font-bold">
                            // FOCUS_STUDY
                          </span>
                          {activeEvents.daySessions.map((s) => (
                            <div key={s.id} className="p-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-white block">{s.subject}</span>
                                {s.topic && <span className="text-[10px] text-slate-400 block mt-0.5">{s.topic}</span>}
                              </div>
                              <span className="font-mono text-xs text-blue-400 font-semibold">{s.duration} mins</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tasks due detail */}
                      {activeEvents.dayTasks.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest block font-bold">
                            // DIRECTIVE_DEADLINES
                          </span>
                          {activeEvents.dayTasks.map((t) => (
                            <div key={t.id} className="p-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between">
                              <span className={`text-xs text-white ${t.completed ? 'line-through text-slate-500' : ''}`}>{t.title}</span>
                              <span className="text-[9px] font-mono uppercase bg-white/5 px-1 rounded text-slate-400">{t.priority}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Projects due detail */}
                      {activeEvents.dayProjects.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest block font-bold">
                            // INITIATIVES_DEADLINES
                          </span>
                          {activeEvents.dayProjects.map((p) => (
                            <div key={p.id} className="p-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                              <span className="text-xs font-bold text-white block">{p.name}</span>
                              <span className="text-[9px] font-mono text-slate-400 mt-0.5 block">{p.status} // {p.progress}%</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Habits logs detail */}
                      {activeEvents.dayHabits.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest block font-bold">
                            // HABIT_CYCLES_COMPLETED
                          </span>
                          <div className="space-y-1.5">
                            {activeEvents.dayHabits.map((l) => {
                              const habit = tasks.find((t) => t.id === l.habitId); // Or query name
                              return (
                                <div key={l.id} className="p-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center gap-2 text-xs text-slate-200">
                                  <Award className="w-4 h-4 text-blue-400 shrink-0" />
                                  <span>Habit log complete</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Empty state for the specific day */}
                      {activeEvents.daySessions.length === 0 &&
                        activeEvents.dayTasks.length === 0 &&
                        activeEvents.dayProjects.length === 0 &&
                        activeEvents.dayHabits.length === 0 && (
                          <p className="text-[10px] text-slate-500 font-mono py-4 text-center">
                            &gt; ZERO LOGGED EVENTS DETECTED ON THIS DATE MATRIX
                          </p>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-white/5 pt-4 text-[9px] font-mono text-slate-500 text-center">
              LEO OS CHRONO_MAP_CONTROLLER // v2.6
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
