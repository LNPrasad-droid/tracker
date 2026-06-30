import React, { useState } from 'react';
import { Task, Project } from '../types';
import GlassCard from './GlassCard';
import { Plus, Search, Filter, Trash2, Calendar, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';

interface TaskManagerViewProps {
  tasks: Task[];
  projects: Project[];
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskManagerView({
  tasks,
  projects,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TaskManagerViewProps) {
  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [category, setCategory] = useState<Task['category']>('work');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('incomplete'); // incomplete, complete, all

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() ? description : undefined,
      priority,
      category,
      dueDate: dueDate || undefined,
      projectId: projectId || undefined,
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('work');
    setDueDate('');
    setProjectId('');
    setShowAddForm(false);
  };

  // Filter and Search logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    let matchesStatus = true;
    if (filterStatus === 'complete') matchesStatus = task.completed;
    if (filterStatus === 'incomplete') matchesStatus = !task.completed;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6" id="task-manager-container">
      {/* HUD Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            TASK_ENGINE <span className="text-blue-400 font-mono text-sm border border-blue-500/30 px-2 py-0.5 rounded-full bg-blue-500/5">ORCHESTRATOR</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
            RESOLVING PRIORITY PIPELINES & DIRECTIVES
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-medium rounded-xl transition-all shadow-[0_4px_20px_rgba(59,130,246,0.25)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'CANCEL_TASK' : 'CREATE_TASK'}
        </button>
      </div>

      {/* Task Creation Form Modal/Panel */}
      {showAddForm && (
        <GlassCard borderAccent className="p-6">
          <h3 className="text-sm font-mono text-blue-400 tracking-widest uppercase mb-4 flex items-center gap-2">
            INJECT_DIRECTIVE_VECTOR
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Directive Title</label>
                <input
                  type="text"
                  required
                  placeholder="Task name or actionable goal..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  placeholder="Supporting instructions or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Priority Layer</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="low" className="bg-[#020408] text-slate-300">LOW</option>
                  <option value="medium" className="bg-[#020408] text-blue-400">MEDIUM</option>
                  <option value="high" className="bg-[#020408] text-amber-400">HIGH</option>
                  <option value="critical" className="bg-[#020408] text-rose-500 font-bold">CRITICAL</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Category Sector</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Task['category'])}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="work" className="bg-[#020408]">WORK</option>
                  <option value="study" className="bg-[#020408]">STUDY</option>
                  <option value="personal" className="bg-[#020408]">PERSONAL</option>
                  <option value="health" className="bg-[#020408]">HEALTH</option>
                  <option value="finance" className="bg-[#020408]">FINANCE</option>
                  <option value="other" className="bg-[#020408]">OTHER</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Chrono Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Project Pipeline</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="" className="bg-[#020408]">NONE / UNRELATED</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id} className="bg-[#020408]">
                      {proj.name}
                    </option>
                  ))}
                </select>
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
                DEPLOY_DIRECTIVE
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Control Filters HUD */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search active directive vectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/30 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* Filters Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-1">Sector:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-black/30 border border-white/5 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">ALL</option>
              <option value="work">WORK</option>
              <option value="study">STUDY</option>
              <option value="personal">PERSONAL</option>
              <option value="health">HEALTH</option>
              <option value="finance">FINANCE</option>
              <option value="other">OTHER</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-1">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-black/30 border border-white/5 rounded-lg px-2.5 py-1 text-[10px] text-slate-300 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="all">ALL</option>
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
              <option value="critical">CRITICAL</option>
            </select>
          </div>

          <div className="flex bg-black/30 border border-white/5 p-1 rounded-lg">
            {(['incomplete', 'complete', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`
                  px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-colors
                  ${filterStatus === status ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'}
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Directives Table/Grid */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              &gt; NO ACTIVE DIRECTIVE VECTORS RESOLVED FOR SPECIFIED FILTER MATRIX
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredTasks.map((task) => {
              const matchedProject = projects.find((p) => p.id === task.projectId);

              return (
                <GlassCard
                  key={task.id}
                  className={`p-4 group flex items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:bg-white/[0.02] ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    {/* Circle Checkbox Trigger */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 sm:mt-0 p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-blue-400 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-400 filter drop-shadow-[0_0_4px_#3b82f6]" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-blue-400" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-semibold text-white ${task.completed ? 'line-through text-slate-500' : ''}`}>
                          {task.title}
                        </span>
                        
                        <span className="px-2 py-0.5 text-[8px] font-mono rounded bg-white/5 border border-white/5 text-slate-400 uppercase tracking-widest">
                          {task.category}
                        </span>

                        {task.priority === 'critical' && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono rounded border border-rose-500/20 bg-rose-500/10 text-rose-400 uppercase tracking-wider animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" /> CRITICAL_DIRECTIVE
                          </span>
                        )}

                        {task.priority === 'high' && (
                          <span className="px-1.5 py-0.5 text-[8px] font-mono rounded border border-amber-500/20 bg-amber-500/10 text-amber-400 uppercase tracking-wider">
                            HIGH
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className={`text-[11px] leading-relaxed font-sans ${task.completed ? 'line-through text-slate-600' : 'text-slate-400'}`}>
                          {task.description}
                        </p>
                      )}

                      {matchedProject && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="text-[9px] font-mono text-blue-400/80 uppercase tracking-widest">
                            PIPELINE: {matchedProject.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 self-stretch sm:self-center border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>BY: {task.dueDate}</span>
                      </div>
                    )}

                    <button
                      onClick={() => onDeleteTask(task.id)}
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
    </div>
  );
}
