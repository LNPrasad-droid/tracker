import { FormEvent, lazy, Suspense, useEffect, useState } from 'react';
import { LeoOSState, Task, StudySession, Project, Milestone, Habit, HabitLog, JournalEntry } from './types';
import { DEFAULT_STATE } from './data/defaultState';
import { LEO_USER_PASSWORD, LEO_USERS, LeoUser, leoApi } from './services/leoApi';

// Main layout components
import SplashScreen from './components/SplashScreen';
import ParticleCanvas from './components/ParticleCanvas';
import GlassCard from './components/GlassCard';

// Core module sub-views
import LionLogo from './components/LionLogo';

const DashboardView = lazy(() => import('./components/DashboardView'));
const StudyTrackerView = lazy(() => import('./components/StudyTrackerView'));
const TaskManagerView = lazy(() => import('./components/TaskManagerView'));
const ProjectManagerView = lazy(() => import('./components/ProjectManagerView'));
const HabitTrackerView = lazy(() => import('./components/HabitTrackerView'));
const JournalView = lazy(() => import('./components/JournalView'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const AnalyticsView = lazy(() => import('./components/AnalyticsView'));
const DatabaseView = lazy(() => import('./components/DatabaseView'));

// Icons
import {
  Home,
  BookOpen,
  CheckSquare,
  Layers,
  Award,
  BookMarked,
  Calendar as CalendarIcon,
  BarChart3,
  Database,
  Volume2,
  VolumeX,
  Clock,
  LockKeyhole,
  UserRound
} from 'lucide-react';

const demoRecordIds = {
  tasks: new Set(['task-1', 'task-2', 'task-3', 'task-4']),
  studySessions: new Set(['study-1', 'study-2', 'study-3']),
  projects: new Set(['project-1', 'project-2']),
  milestones: new Set(['ms-1', 'ms-2', 'ms-3']),
  habits: new Set(['habit-1', 'habit-2', 'habit-3']),
  habitLogs: new Set(['log-1', 'log-2', 'log-3', 'log-4', 'log-5', 'log-6', 'log-7', 'log-8', 'log-9', 'log-10', 'log-11']),
  journalEntries: new Set(['journal-1', 'journal-2']),
};

const removeDemoRecords = (loadedState: LeoOSState): LeoOSState => ({
  ...loadedState,
  tasks: loadedState.tasks.filter((item) => !demoRecordIds.tasks.has(item.id)),
  studySessions: loadedState.studySessions.filter((item) => !demoRecordIds.studySessions.has(item.id)),
  projects: loadedState.projects.filter((item) => !demoRecordIds.projects.has(item.id)),
  milestones: loadedState.milestones.filter((item) => !demoRecordIds.milestones.has(item.id)),
  habits: loadedState.habits.filter((item) => !demoRecordIds.habits.has(item.id)),
  habitLogs: loadedState.habitLogs.filter((item) => !demoRecordIds.habitLogs.has(item.id)),
  journalEntries: loadedState.journalEntries.filter((item) => !demoRecordIds.journalEntries.has(item.id)),
});

export default function App() {
  const [booted, setBooted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [state, setState] = useState<LeoOSState>(DEFAULT_STATE);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [syncStatus, setSyncStatus] = useState<'loading' | 'online' | 'offline' | 'saving'>('loading');
  const [selectedUser, setSelectedUser] = useState<LeoUser>('Leo');
  const [currentUser, setCurrentUser] = useState<LeoUser | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // 1. Initial State Load from shared FastAPI/MySQL backend
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;

    const loadState = async () => {
      try {
        const serverState = removeDemoRecords(await leoApi.getState(currentUser));
        if (!isMounted) return;
        setState(serverState);
        setSoundEnabled(serverState.settings.soundEnabled);
        setSyncStatus('online');
      } catch (error) {
        console.error('Failed to load Leo OS state from FastAPI', error);
        if (isMounted) setSyncStatus('offline');
      }
    };

    loadState();
    const interval = window.setInterval(loadState, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [currentUser]);

  // Sync state changes to FastAPI. The PWA service worker queues writes while offline.
  const saveState = async (newState: LeoOSState) => {
    if (!currentUser) return;
    setState(newState);
    setSyncStatus(navigator.onLine ? 'saving' : 'offline');

    try {
      const persistedState = await leoApi.saveState(currentUser, newState);
      setState(persistedState);
      setSoundEnabled(persistedState.settings.soundEnabled);
      setSyncStatus('online');
    } catch (error) {
      console.error('Failed to persist Leo OS state through FastAPI', error);
      setSyncStatus('offline');
    }
  };

  // 2. Real-time UTC clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }) + ' // UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------------------------------------------
  // SYSTEM DIRECTIVE ACTIONS (STATE CONTROLLERS)
  // ---------------------------------------------------------------------------

  // A. Tasks controller
  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...state,
      tasks: [...state.tasks, newTask],
    };
    void saveState(updated);
  };

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = state.tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : undefined,
        };
      }
      return task;
    });

    // Check if task is associated with a project, update project progress % if needed
    const updated = {
      ...state,
      tasks: updatedTasks,
    };
    void saveState(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = {
      ...state,
      tasks: state.tasks.filter((t) => t.id !== taskId),
    };
    void saveState(updated);
  };

  // B. Study Sessions controller
  const handleAddStudySession = (sessionData: Omit<StudySession, 'id' | 'createdAt'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `study-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...state,
      studySessions: [...state.studySessions, newSession],
    };
    void saveState(updated);
  };

  const handleDeleteStudySession = (id: string) => {
    const updated = {
      ...state,
      studySessions: state.studySessions.filter((s) => s.id !== id),
    };
    void saveState(updated);
  };

  // C. Projects controller
  const handleAddProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...state,
      projects: [...state.projects, newProject],
    };
    void saveState(updated);
  };

  const handleAddMilestone = (milestoneData: Omit<Milestone, 'id' | 'completed'>) => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: `ms-${Date.now()}`,
      completed: false,
    };
    const updated = {
      ...state,
      milestones: [...state.milestones, newMilestone],
    };
    void saveState(updated);
  };

  const handleToggleMilestone = (milestoneId: string) => {
    const updatedMilestones = state.milestones.map((ms) => {
      if (ms.id === milestoneId) {
        return {
          ...ms,
          completed: !ms.completed,
          completedAt: !ms.completed ? new Date().toISOString() : undefined,
        };
      }
      return ms;
    });
    const updated = {
      ...state,
      milestones: updatedMilestones,
    };
    void saveState(updated);
  };

  // D. Habits controller
  const handleAddHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'streakCurrent' | 'streakMax'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      createdAt: new Date().toISOString(),
      streakCurrent: 0,
      streakMax: 0,
    };
    const updated = {
      ...state,
      habits: [...state.habits, newHabit],
    };
    void saveState(updated);
  };

  const handleToggleHabitLog = (habitId: string, date: string) => {
    const existingIndex = state.habitLogs.findIndex((log) => log.habitId === habitId && log.date === date);

    let updatedLogs = [...state.habitLogs];
    let isCompleted = false;

    if (existingIndex > -1) {
      // Toggle completion status or remove log
      const log = updatedLogs[existingIndex];
      if (log.completed) {
        updatedLogs.splice(existingIndex, 1); // delete log entry
      } else {
        updatedLogs[existingIndex].completed = true;
        isCompleted = true;
      }
    } else {
      updatedLogs.push({
        id: `log-${Date.now()}`,
        habitId,
        date,
        completed: true,
      });
      isCompleted = true;
    }

    // Re-calculate streaks for this habit based on logs history
    const updatedHabits = state.habits.map((h) => {
      if (h.id === habitId) {
        let currentStreak = h.streakCurrent;
        let maxStreak = h.streakMax;

        if (isCompleted) {
          currentStreak += 1;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = Math.max(0, currentStreak - 1);
        }

        return {
          ...h,
          streakCurrent: currentStreak,
          streakMax: maxStreak,
          lastCompletedDate: isCompleted ? date : h.lastCompletedDate,
        };
      }
      return h;
    });

    const updated = {
      ...state,
      habitLogs: updatedLogs,
      habits: updatedHabits,
    };
    void saveState(updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = {
      ...state,
      habits: state.habits.filter((h) => h.id !== id),
      habitLogs: state.habitLogs.filter((l) => l.habitId !== id),
    };
    void saveState(updated);
  };

  // E. Journal controller
  const handleAddJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'date'>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry: JournalEntry = {
      ...entryData,
      id: `journal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      date: todayStr,
    };
    const updated = {
      ...state,
      journalEntries: [...state.journalEntries, newEntry],
    };
    void saveState(updated);
  };

  const handleDeleteJournalEntry = (id: string) => {
    const updated = {
      ...state,
      journalEntries: state.journalEntries.filter((e) => e.id !== id),
    };
    void saveState(updated);
  };

  const handleUpdateQuickNote = (quickNote: string) => {
    const updated = {
      ...state,
      settings: {
        ...state.settings,
        quickNote,
      },
    };
    void saveState(updated);
  };

  const handleToggleSound = () => {
    const nextSoundEnabled = !soundEnabled;
    setSoundEnabled(nextSoundEnabled);
    const updated = {
      ...state,
      settings: {
        ...state.settings,
        soundEnabled: nextSoundEnabled,
      },
    };
    void saveState(updated);
  };

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    if (passwordInput !== LEO_USER_PASSWORD) {
      setLoginError('ACCESS DENIED // INVALID PASSWORD');
      return;
    }

    const userState = {
      ...DEFAULT_STATE,
      settings: {
        ...DEFAULT_STATE.settings,
        userName: selectedUser,
      },
    };

    setCurrentUser(selectedUser);
    setState(userState);
    setSoundEnabled(userState.settings.soundEnabled);
    setPasswordInput('');
    setLoginError('');
    setSyncStatus('loading');
  };

  // ---------------------------------------------------------------------------
  // SYSTEM NAVIGATION RENDERER
  // ---------------------------------------------------------------------------
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            tasks={state.tasks}
            studySessions={state.studySessions}
            projects={state.projects}
            habits={state.habits}
            quickNote={state.settings.quickNote || ''}
            onNavigate={setActiveTab}
            onToggleTask={handleToggleTask}
            onUpdateQuickNote={handleUpdateQuickNote}
          />
        );
      case 'study':
        return (
          <StudyTrackerView
            sessions={state.studySessions}
            onAddSession={handleAddStudySession}
            onDeleteSession={handleDeleteStudySession}
          />
        );
      case 'tasks':
        return (
          <TaskManagerView
            tasks={state.tasks}
            projects={state.projects}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'projects':
        return (
          <ProjectManagerView
            projects={state.projects}
            milestones={state.milestones}
            tasks={state.tasks}
            onAddProject={handleAddProject}
            onAddMilestone={handleAddMilestone}
            onToggleMilestone={handleToggleMilestone}
          />
        );
      case 'habits':
        return (
          <HabitTrackerView
            habits={state.habits}
            habitLogs={state.habitLogs}
            onAddHabit={handleAddHabit}
            onToggleHabitLog={handleToggleHabitLog}
            onDeleteHabit={handleDeleteHabit}
          />
        );
      case 'journal':
        return (
          <JournalView
            entries={state.journalEntries}
            onAddEntry={handleAddJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={state.tasks}
            studySessions={state.studySessions}
            projects={state.projects}
            habitLogs={state.habitLogs}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            tasks={state.tasks}
            studySessions={state.studySessions}
            projects={state.projects}
            habits={state.habits}
          />
        );
      case 'database':
        return <DatabaseView syncStatus={syncStatus} />;
      default:
        return <div className="text-white font-mono uppercase text-xs">&gt; SYS_FATAL_ERROR: TAB_NOT_RESOLVED</div>;
    }
  };

  // Nav menu schema
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'DASHBOARD', icon: Home },
    { id: 'study', label: 'STUDY_TRACKER', icon: BookOpen },
    { id: 'tasks', label: 'TASK_MANAGER', icon: CheckSquare },
    { id: 'projects', label: 'PROJECT_MANAGER', icon: Layers },
    { id: 'habits', label: 'HABIT_TRACKER', icon: Award },
    { id: 'journal', label: 'JOURNAL', icon: BookMarked },
    { id: 'calendar', label: 'CALENDAR', icon: CalendarIcon },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3 },
    { id: 'database', label: 'MYSQL_DATABASE', icon: Database },
  ];

  if (!currentUser) {
    return (
      <div className="relative min-h-screen bg-[#050505] text-slate-100 font-sans flex items-center justify-center p-6 select-none">
        <ParticleCanvas />
        <GlassCard borderAccent className="relative z-10 w-full max-w-md p-6">
          <div className="mb-6 flex items-center gap-3">
            <LionLogo className="h-10 w-10" animated={false} />
            <div>
              <h1 className="text-sm font-black tracking-[0.25em] text-white font-sans">LEO OS</h1>
              <p className="mt-1 text-[9px] font-mono uppercase tracking-widest text-blue-400">AUTHORIZED_USERS_ONLY</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-[10px] font-mono uppercase tracking-widest text-slate-400">Select User</label>
              <div className="grid grid-cols-2 gap-2">
                {LEO_USERS.map((user) => (
                  <button
                    key={user}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                      selectedUser === user
                        ? 'border-blue-400/40 bg-blue-500/15 text-blue-200'
                        : 'border-white/10 bg-black/30 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserRound className="h-4 w-4" />
                    {user}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-[10px] font-mono uppercase tracking-widest text-slate-400">Password</span>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 focus-within:border-blue-400/60">
                <LockKeyhole className="h-4 w-4 text-blue-300" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  autoFocus
                  className="min-w-0 flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-slate-600"
                  placeholder="Enter access code"
                />
              </div>
            </label>

            {loginError && <p className="text-[10px] font-mono uppercase tracking-widest text-rose-300">{loginError}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95 cursor-pointer"
            >
              UNLOCK_PROFILE
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  if (!booted) {
    return <SplashScreen onComplete={() => setBooted(true)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-slate-100 font-sans flex flex-col md:flex-row select-none" id="leo-os-desktop">
      {/* 1. Futuristic interactive background canvas */}
      <ParticleCanvas />

      {/* 2. Side navigation control dock */}
      <aside
        id="side-navigation-panel"
        className="relative z-20 w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col shrink-0"
      >
        {/* Brand/System core panel */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <LionLogo className="w-9 h-9" animated={false} />
          <div>
            <h1 className="text-sm font-black tracking-[0.25em] text-white font-sans">TRACKER</h1>
            <p className="text-[9px] font-mono text-blue-400 tracking-widest uppercase mt-0.5">MYSQL_EDITION_2.6</p>
          </div>
        </div>

        {/* Dynamic Nav buttons lists */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left font-mono text-[10px] tracking-wider transition-all duration-300 cursor-pointer
                  ${isActive
                    ? 'bg-white/10 border border-white/10 text-blue-400 font-bold shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom system indicators controller */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/20 font-mono text-[9px] text-slate-500">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-slate-600 animate-pulse" />
            <span>{syncStatus === 'online' ? 'MYSQL_SYNC' : syncStatus === 'saving' ? 'SYNCING' : 'OFFLINE_QUEUE'}</span>
          </div>

          <button
            onClick={handleToggleSound}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-500" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>

      {/* 3. Main content stage */}
      <main className="relative z-10 flex-1 flex flex-col min-w-0" id="main-content-stage">
        {/* Decorative Background Elements from Sleek Interface Theme */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none z-0"></div>

        {/* Global system status header bar */}
        <header className="h-20 border-b border-white/5 bg-black/10 backdrop-blur-md px-8 flex items-center justify-between shrink-0 font-mono text-[10px] tracking-widest text-slate-400 relative z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" /> {currentTime}</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
              <p className="text-[10px] font-mono text-blue-400 font-bold">NEURAL LINK: OPTIMAL</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span>USER: {state.settings.userName.toUpperCase()}</span>
          </div>
        </header>

        {/* Scrollable primary display area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto relative z-10">
          <Suspense fallback={<div className="text-white font-mono uppercase text-xs">&gt; LOADING_MODULE...</div>}>
            {renderActiveView()}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
