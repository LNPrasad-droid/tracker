import React, { useState } from 'react';
import { JournalEntry } from '../types';
import GlassCard from './GlassCard';
import { Plus, BookOpen, Trash2, Calendar, Smile, Search, Sparkles } from 'lucide-react';

interface JournalViewProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'date'>) => void;
  onDeleteEntry: (entryId: string) => void;
}

// Simple robust custom Markdown parser to format journal entries beautifully
function MiniMarkdownRenderer({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n');

  return (
    <div className="space-y-2 text-slate-300 font-sans text-xs leading-relaxed">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h5 key={idx} className="text-white font-bold text-sm tracking-wide mt-3 mb-1 uppercase font-mono text-blue-400">{line.replace('### ', '')}</h5>;
        }
        if (line.startsWith('## ')) {
          return <h4 key={idx} className="text-white font-extrabold text-base tracking-tight mt-4 mb-2 font-mono text-blue-400">{line.replace('## ', '')}</h4>;
        }
        if (line.startsWith('# ')) {
          return <h3 key={idx} className="text-white font-extrabold text-lg tracking-tight mt-5 mb-3 font-sans">{line.replace('# ', '')}</h3>;
        }
        
        // Bullet points
        if (line.startsWith('* ') || line.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>{line.substring(2)}</span>
            </div>
          );
        }

        // Bold text bolding (simple replace)
        if (line.includes('**')) {
          const parts = line.split('**');
          return (
            <p key={idx}>
              {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-semibold">{part}</strong> : part)}
            </p>
          );
        }

        // Standard empty line
        if (line.trim() === '') {
          return <div key={idx} className="h-2" />;
        }

        // Fallback standard paragraph
        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
}

export default function JournalView({
  entries,
  onAddEntry,
  onDeleteEntry,
}: JournalViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(entries[0]?.id || null);

  // Journal form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('neutral');
  const [tagsString, setTagsString] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsString
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    onAddEntry({
      title: title.trim(),
      content: content.trim(),
      mood,
      tags,
    });

    setTitle('');
    setContent('');
    setMood('neutral');
    setTagsString('');
    setShowAddForm(false);
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const activeEntry = entries.find((e) => e.id === selectedEntryId) || entries[0];

  return (
    <div className="space-y-6" id="journal-view-container">
      {/* HUD Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            JOURNAL_LOGGER <span className="text-blue-400 font-mono text-sm border border-blue-500/30 px-2 py-0.5 rounded-full bg-blue-500/5">ARCHIVE</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">
            RECORDING COGNITIVE FLOWS, REFLECTIONS & METRICS
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-medium rounded-xl transition-all shadow-[0_4px_20px_rgba(59,130,246,0.25)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'ABORT_ENTRY' : 'WRITE_ENTRY'}
        </button>
      </div>

      {/* Write New Journal entry Panel */}
      {showAddForm && (
        <GlassCard borderAccent className="p-6">
          <h3 className="text-sm font-mono text-blue-400 tracking-widest uppercase mb-4 flex items-center gap-2">
            INITIALIZE_NEW_JOURNAL_BLOCK
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Entry Title</label>
                <input
                  type="text"
                  required
                  placeholder="Designation..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Mood Indicator</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value as JournalEntry['mood'])}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="excellent">EXCELLENT</option>
                    <option value="good">GOOD</option>
                    <option value="neutral">NEUTRAL</option>
                    <option value="low">LOW</option>
                    <option value="exhausted">EXHAUSTED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Tags (Comma Sep)</label>
                  <input
                    type="text"
                    placeholder="ideas, architecture"
                    value={tagsString}
                    onChange={(e) => setTagsString(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Reflections Content (Markdown Supported)</label>
              <textarea
                required
                rows={8}
                placeholder="Write your logs, thoughts, or research summaries here. Support `# headers`, `* bullets`, and `**bold**` styles..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-slate-300 font-sans focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
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
                COMMIT_RECORDS
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Entries List & Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search reflections journal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {filteredEntries.map((entry) => {
              const isActive = activeEntry?.id === entry.id;
              return (
                <GlassCard
                  key={entry.id}
                  onClick={() => setSelectedEntryId(entry.id)}
                  borderAccent={isActive}
                  className={`p-4 hover:bg-white/[0.02] transition-colors`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {entry.date}</span>
                    <span className="uppercase text-blue-400">{entry.mood}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5 truncate">{entry.title}</h4>
                  
                  {/* Tag capsules */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Entry Reader Pane */}
        <div className="lg:col-span-2">
          {activeEntry ? (
            <GlassCard borderAccent className="p-6 h-full flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-blue-400 tracking-widest uppercase">
                        ENTRY_RECORDS_CONSOLE // {activeEntry.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1.5">{activeEntry.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl">
                    <Smile className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-mono text-white uppercase tracking-widest">{activeEntry.mood || 'neutral'}</span>
                  </div>
                </div>

                {/* Markdown Render Content Area */}
                <div className="min-h-[250px] leading-relaxed select-text">
                  <MiniMarkdownRenderer markdown={activeEntry.content} />
                </div>
              </div>

              {/* Footer details */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                <div className="flex flex-wrap gap-1.5">
                  {activeEntry.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onDeleteEntry(activeEntry.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors text-xs font-mono"
                >
                  <Trash2 className="w-3.5 h-3.5" /> DELETE_BLOCK
                </button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center">
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                &gt; NO JOURNAL LOGS COMMITTED TO COGNITIVE RAM. WRITE AN ENTRY TO AWAKEN MEMORY CONTROLLER
              </p>
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
}
