import React, { useMemo, useState } from 'react';
import { ChevronDown, FolderKanban, Search, X } from 'lucide-react';

const normalize = (v) => (v === undefined || v === null ? '' : `${v}`);
const getProjectId = (p) => normalize(p?.id || p?._id);

const ProjectSelect = ({ projects, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const normalizedProjects = useMemo(
    () => (projects || []).map(p => ({ ...p, _idNorm: getProjectId(p) })).filter(p => !!p._idNorm),
    [projects]
  );

  const selected = useMemo(
    () => normalizedProjects.find(p => normalize(p._idNorm) === normalize(value)) || null,
    [normalizedProjects, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalizedProjects;
    return normalizedProjects.filter(p => (p?.name || '').toLowerCase().includes(q));
  }, [normalizedProjects, query]);

  const select = (p) => {
    onChange(getProjectId(p));
    setOpen(false);
    setQuery('');
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-colors
          bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center shadow-sm">
            <FolderKanban size={16} />
          </div>
          <div className="min-w-0 text-left">
            <div className={`text-sm font-semibold truncate ${selected ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {selected ? selected.name : 'Assign a project (optional)'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {selected ? 'Click to change' : 'You can assign later'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {selected ? (
            <button
              type="button"
              onClick={clear}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              title="Clear"
            >
              <X size={16} />
            </button>
          ) : null}
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-xl overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-primary/20 transition-all
                  bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-800 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">No projects</div>
            ) : (
              filtered.map(p => (
                <button
                  key={p._idNorm}
                  type="button"
                  onClick={() => select(p)}
                  className={`w-full px-3 py-2 rounded-xl text-left transition-colors ${normalize(p._idNorm) === normalize(value) ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">{p.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.description || '—'}</div>
                </button>
              ))
            )}
          </div>

          <div className="p-2 border-t border-gray-200 dark:border-white/10 flex justify-end">
            <button
              type="button"
              onClick={() => { setOpen(false); setQuery(''); }}
              className="px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelect;
