import React, { useState } from 'react';
import { StudySession } from '../types';
import GlassCard from './GlassCard';
import { BookOpen, Award, Plus, Hourglass, BarChart3, Clock, Flame, Calendar, Trash2 } from 'lucide-react';

interface StudyTrackerViewProps {
  sessions: StudySession[];
  onAddSession: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  onDeleteSession: (id: string) => void;
}

export default function StudyTrackerView({
  sessions,
  onAddSession,
  onDeleteSession,
}: StudyTrackerViewProps) {
  // New session state form
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [notes, setNotes] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    onAddSession({
      subject,
      topic: topic.trim() ? topic : undefined,
      duration: Number(duration),
      date: new Date().toISOString().split('T')[0],
      difficulty,
      notes: notes.trim() ? notes : undefined,
    });

    // Reset fields
    setSubject('');
    setTopic('');
    setDuration(60);
    setDifficulty('medium');
    setNotes('');
    setShowAddForm(false);
  };

  // Stats Calculation
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Filter study sessions for today, this week, this month
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMinutes = sessions
    .filter((s) => s.date === todayStr)
    .reduce((sum, s) => sum + s.duration, 0);
  const todayHours = (todayMinutes / 60).toFixed(1);

  // Group by Subject for telemetry visualization
  const subjectDistribution: { [key: string]: number } = {};
  sessions.forEach((s) => {
    subjectDistribution[s.subject] = (subjectDistribution[s.subject] || 0) + s.duration;
  });

  const subjectsList = Object.keys(subjectDistribution);
  const maxMinutes = Math.max(...Object.values(subjectDistribution), 1);

  return (
    <div className="space-y-6" id="study-tracker-container">
      {/* HUD Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            STUDY_COMPILER <span className="text-blue-400 font-mono text-sm border border-blue-500/30 px-2 py-0.5 rounded-full bg-blue-500/5">TELEMETRY</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
            MEASURING INTELLECTUAL THROUGHPUT & DISCIPLINE
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-medium rounded-xl transition-all shadow-[0_4px_20px_rgba(59,130,246,0.25)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'ABORT_SESSION' : 'LOG_SESSION'}
        </button>
      </div>

      {/* Grid of study stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider">DAILY_YIELD</p>
            <h4 className="text-2xl font-bold text-white mt-1">{todayHours} <span className="text-slate-500 text-xs">HRS</span></h4>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider">TOTAL_FOCUSED_MATH</p>
            <h4 className="text-2xl font-bold text-white mt-1">{totalHours} <span className="text-slate-500 text-xs">HRS</span></h4>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider">SESSIONS_COMPILED</p>
            <h4 className="text-2xl font-bold text-white mt-1">{sessions.length} <span className="text-slate-500 text-xs">RUNS</span></h4>
          </div>
        </GlassCard>
      </div>

      {/* Adding Session Form Modal/Panel */}
      {showAddForm && (
        <GlassCard borderAccent className="p-6">
          <h3 className="text-sm font-mono text-blue-400 tracking-widest uppercase mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} /> INJECT_COGNITIVE_LOG_RECORD
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Subject / Branch</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Topic / Domain</label>
                <input
                  type="text"
                  placeholder="e.g. Matrix Algebra"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="480"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Difficulty Load</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`
                        flex-1 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest border transition-all
                        ${difficulty === diff
                          ? 'bg-blue-500/20 border-blue-400 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                          : 'bg-transparent border-white/5 text-slate-400 hover:border-white/10'
                        }
                      `}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Session Notes / Synthesized Formulas</label>
                <input
                  type="text"
                  placeholder="Key discoveries or formulas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-white/5 rounded-xl hover:bg-white/5 text-slate-400 font-mono text-xs transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                COMMIT_DATA
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Content Split: Distribution and Logged Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject distribution vector mapping (custom beautiful SVG visualization) */}
        <GlassCard className="p-6 h-fit">
          <h3 className="text-sm font-mono text-slate-300 tracking-widest uppercase mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" /> TOPIC_DISTRIBUTION_MAP
          </h3>

          {subjectsList.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 font-mono">
              &gt; NO FOCUS DATA AVAILABLE
            </p>
          ) : (
            <div className="space-y-4">
              {subjectsList.map((subject) => {
                const mins = subjectDistribution[subject];
                const pct = (mins / maxMinutes) * 100;
                return (
                  <div key={subject} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-white">{subject}</span>
                      <span className="font-mono text-slate-400">{(mins / 60).toFixed(1)} hrs</span>
                    </div>
                    {/* SVG Progress bar bar */}
                    <div className="h-2 bg-blue-950/30 border border-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.3)] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Sessions Logs list */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-mono text-slate-300 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-blue-400" /> HISTORIC_FOCAL_RUNS
            </h3>

            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 font-mono">
                &gt; NO LOGGED SESSIONS COMMITTED TO DISK
              </p>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {sessions
                  .slice()
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((session) => (
                    <div
                      key={session.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/[0.01] border border-white/5 rounded-xl hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                            {session.subject}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 uppercase tracking-widest">
                            {session.difficulty}
                          </span>
                        </div>
                        {session.topic && (
                          <h4 className="text-xs font-semibold text-white tracking-wide">{session.topic}</h4>
                        )}
                        {session.notes && (
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{session.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-white">{session.duration} MIN</span>
                          <p className="text-[9px] font-mono text-slate-500 mt-0.5">{session.date}</p>
                        </div>
                        
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
