import React, { useState } from 'react';
import { Project, Milestone, Task } from '../types';
import GlassCard from './GlassCard';
import { Layers, Plus, Calendar, CheckSquare, ChevronRight, BarChart, FileText, CheckCircle2, Circle } from 'lucide-react';

interface ProjectManagerViewProps {
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onAddMilestone: (milestone: Omit<Milestone, 'id' | 'completed'>) => void;
  onToggleMilestone: (milestoneId: string) => void;
}

export default function ProjectManagerView({
  projects,
  milestones,
  tasks,
  onAddProject,
  onAddMilestone,
  onToggleMilestone,
}: ProjectManagerViewProps) {
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);

  // Project form fields
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectDue, setProjectDue] = useState('');
  const [projectStatus, setProjectStatus] = useState<Project['status']>('active');

  // Milestone form fields
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDue, setMilestoneDue] = useState('');
  const [showAddMilestoneForm, setShowAddMilestoneForm] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    onAddProject({
      name: projectName.trim(),
      description: projectDesc.trim() ? projectDesc : undefined,
      status: projectStatus,
      dueDate: projectDue || undefined,
      progress: 0,
    });

    setProjectName('');
    setProjectDesc('');
    setProjectDue('');
    setProjectStatus('active');
    setShowAddProjectForm(false);
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !milestoneTitle.trim()) return;

    onAddMilestone({
      projectId: selectedProjectId,
      title: milestoneTitle.trim(),
      description: milestoneDesc.trim() ? milestoneDesc : undefined,
      dueDate: milestoneDue || undefined,
    });

    setMilestoneTitle('');
    setMilestoneDesc('');
    setMilestoneDue('');
    setShowAddMilestoneForm(false);
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectMilestones = milestones.filter((m) => m.projectId === activeProject?.id);
  const projectTasks = tasks.filter((t) => t.projectId === activeProject?.id);

  return (
    <div className="space-y-6" id="project-manager-container">
      {/* HUD Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            PROJECT_ORCHESTRATOR <span className="text-blue-400 font-mono text-sm border border-blue-500/30 px-2 py-0.5 rounded-full bg-blue-500/5">PIPELINE</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
            MONITORING MISSION-CRITICAL INITIATIVES & STAGES
          </p>
        </div>

        <button
          onClick={() => setShowAddProjectForm(!showAddProjectForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-medium rounded-xl transition-all shadow-[0_4px_20px_rgba(59,130,246,0.25)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {showAddProjectForm ? 'ABORT_INITIATIVE' : 'LAUNCH_INITIATIVE'}
        </button>
      </div>

      {/* Add Project Form Modal */}
      {showAddProjectForm && (
        <GlassCard borderAccent className="p-6">
          <h3 className="text-sm font-mono text-blue-400 tracking-widest uppercase mb-4 flex items-center gap-2">
            INITIALIZE_NEW_DEVELOPMENT_PIPELINE
          </h3>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Pipeline Name</label>
                <input
                  type="text"
                  required
                  placeholder="Initiative designation..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Strategic Goal / Notes</label>
                <input
                  type="text"
                  placeholder="Core intent behind this initiative..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Pipeline State</label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value as Project['status'])}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="planning">PLANNING</option>
                  <option value="active">ACTIVE</option>
                  <option value="paused">PAUSED</option>
                  <option value="completed">COMPLETED</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Target Resolution Date</label>
                <input
                  type="date"
                  value={projectDue}
                  onChange={(e) => setProjectDue(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddProjectForm(false)}
                className="px-4 py-2 border border-white/5 rounded-xl hover:bg-white/5 text-slate-400 font-mono text-xs transition-colors"
              >
                ABORT
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                DEPLOY_INITIATIVE
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Primary Split View: Left List / Right Active Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left projects pipelines list */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-mono text-slate-500 tracking-widest uppercase px-1">
            ACTIVE_DEVLOPMENT_SECTORS ({projects.length})
          </h3>

          <div className="space-y-2">
            {projects.map((proj) => (
              <GlassCard
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                borderAccent={selectedProjectId === proj.id}
                className={`p-4 hover:bg-white/[0.02] transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">{proj.status}</span>
                  {proj.dueDate && <span className="text-[9px] font-mono text-slate-500">DUE: {proj.dueDate}</span>}
                </div>
                <h4 className="text-sm font-bold text-white mt-1.5 truncate">{proj.name}</h4>
                
                {/* Micro Progress Bar */}
                <div className="space-y-1 mt-3">
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>PROGRESS_TELEMETRY</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className="h-1 bg-blue-950/40 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-2 space-y-6">
          {activeProject ? (
            <GlassCard borderAccent className="p-6">
              {/* Project Header Area */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                      PIPELINE_CONSOLE // {activeProject.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{activeProject.name}</h3>
                  {activeProject.description && (
                    <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1">
                      {activeProject.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-xs font-mono text-slate-500">COMPLETE_BY</span>
                  <span className="text-xs font-mono font-bold text-white mt-0.5">
                    {activeProject.dueDate || 'CONTINUOUS'}
                  </span>
                </div>
              </div>

              {/* Milestones and Project Tasks sub-sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                
                {/* Milestones Sector */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono text-slate-300 tracking-widest uppercase flex items-center gap-1.5">
                      <ChevronRight className="w-4 h-4 text-blue-400" /> STAGE_MILESTONES
                    </h4>
                    
                    <button
                      onClick={() => setShowAddMilestoneForm(!showAddMilestoneForm)}
                      className="text-[9px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> {showAddMilestoneForm ? 'CLOSE' : 'INJECT'}
                    </button>
                  </div>

                  {/* Add Milestone Form */}
                  {showAddMilestoneForm && (
                    <form onSubmit={handleCreateMilestone} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                      <input
                        type="text"
                        required
                        placeholder="Milestone title..."
                        value={milestoneTitle}
                        onChange={(e) => setMilestoneTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <input
                        type="date"
                        value={milestoneDue}
                        onChange={(e) => setMilestoneDue(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddMilestoneForm(false)}
                          className="px-2 py-1 text-[9px] font-mono text-slate-500"
                        >
                          ABORT
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[9px] rounded-lg"
                        >
                          COMMIT
                        </button>
                      </div>
                    </form>
                  )}

                  {projectMilestones.length === 0 ? (
                    <p className="text-[10px] text-slate-500 font-mono py-2">
                      &gt; NO STAGE MILESTONES RESOLVED
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {projectMilestones.map((ms) => (
                        <div
                          key={ms.id}
                          className="flex items-center gap-2.5 p-2.5 bg-white/[0.01] border border-white/5 rounded-lg"
                        >
                          <button onClick={() => onToggleMilestone(ms.id)} className="text-slate-600 hover:text-blue-400">
                            {ms.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-medium text-white block truncate ${ms.completed ? 'line-through text-slate-500' : ''}`}>
                              {ms.title}
                            </span>
                            {ms.dueDate && (
                              <span className="text-[9px] font-mono text-slate-500">DUE: {ms.dueDate}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-Tasks Sector */}
                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-slate-300 tracking-widest uppercase flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-blue-400" /> PIPELINE_SUBTASKS
                  </h4>

                  {projectTasks.length === 0 ? (
                    <p className="text-[10px] text-slate-500 font-mono py-2">
                      &gt; NO RELEVANT DIRECTIVE TASKS LOGGED
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {projectTasks.map((t) => (
                        <div key={t.id} className="p-2.5 bg-white/[0.01] border border-white/5 rounded-lg flex items-center justify-between">
                          <span className={`text-xs font-medium ${t.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                            {t.title}
                          </span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${t.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {t.completed ? 'done' : 'active'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center">
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                &gt; NO ACTIVE PRODUCTION PIPELINES EXIST. INITIALIZE ONE TO ACTIVATE SYSTEM CONSOLE
              </p>
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
}
