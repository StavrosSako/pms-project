import React, { useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

const normalize = (v) => (v === undefined || v === null ? '' : `${v}`);

const displayNameForUser = (u) => {
  const first = (u?.firstName || '').trim();
  const last = (u?.lastName || '').trim();
  if (first || last) return `${first} ${last}`.trim();
  if (u?.name) return `${u.name}`;
  if (u?.username) return `${u.username}`;
  return u?.email || `${u?.id || u?._id || ''}`;
};

const initialsForUser = (u) => {
  const first = (u?.firstName || '').trim();
  const last = (u?.lastName || '').trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  const name = (u?.name || '').trim();
  if (name) return name.split(/\s+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const uname = (u?.username || '').trim();
  if (uname) return uname.slice(0, 2).toUpperCase();
  const email = (u?.email || '').trim();
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
};

const colorClasses = [
  'from-blue-500 to-cyan-400',
  'from-purple-500 to-pink-400',
  'from-orange-400 to-amber-300',
  'from-emerald-500 to-teal-400',
  'from-indigo-500 to-blue-400',
  'from-slate-600 to-slate-500'
];

const colorForId = (id) => {
  const str = normalize(id);
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return colorClasses[h % colorClasses.length];
};

const Avatar = ({ user, size = 28 }) => {
  const id = user?.id || user?._id;
  const gradient = colorForId(id);
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-sm`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: Math.max(10, Math.floor(size / 2.4)) }}>
        {initialsForUser(user)}
      </span>
    </div>
  );
};

const OptionRow = ({ user, selected, onSelect }) => {
  const name = displayNameForUser(user);
  const secondary = user?.email || user?.username || '';

  return (
    <button
      type="button"
      onClick={() => onSelect(user)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
        selected ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'
      }`}
    >
      <Avatar user={user} size={28} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">{name}</div>
        {secondary ? <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{secondary}</div> : null}
      </div>
      {selected ? (
        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Check size={16} />
        </div>
      ) : null}
    </button>
  );
};

export const UserSingleSelect = ({
  users,
  value,
  onChange,
  placeholder = 'Select...'
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);

  const normalizedUsers = useMemo(
    () => (users || []).map(u => ({ ...u, _idNorm: normalize(u?.id || u?._id) })).filter(u => !!u._idNorm),
    [users]
  );

  const selected = useMemo(
    () => normalizedUsers.find(u => normalize(u._idNorm) === normalize(value)) || null,
    [normalizedUsers, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalizedUsers;
    return normalizedUsers.filter(u => {
      const name = displayNameForUser(u).toLowerCase();
      const email = (u?.email || '').toLowerCase();
      const username = (u?.username || '').toLowerCase();
      return name.includes(q) || email.includes(q) || username.includes(q);
    });
  }, [normalizedUsers, query]);

  const handleSelect = (user) => {
    onChange(normalize(user?._idNorm));
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-colors
          bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10"
      >
        <div className="flex items-center gap-3 min-w-0">
          {selected ? <Avatar user={selected} size={28} /> : <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-white/10" />}
          <div className="min-w-0 text-left">
            <div className={`text-sm font-semibold truncate ${selected ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {selected ? displayNameForUser(selected) : placeholder}
            </div>
            {selected?.email ? <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{selected.email}</div> : null}
          </div>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-xl overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-primary/20 transition-all
                  bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-800 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">No results</div>
            ) : (
              filtered.map(u => (
                <OptionRow
                  key={u._idNorm}
                  user={u}
                  selected={normalize(u._idNorm) === normalize(value)}
                  onSelect={handleSelect}
                />
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

export const UserMultiSelect = ({
  users,
  values,
  onChange,
  placeholder = 'Add members...'
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const normalizedUsers = useMemo(
    () => (users || []).map(u => ({ ...u, _idNorm: normalize(u?.id || u?._id) })).filter(u => !!u._idNorm),
    [users]
  );

  const selectedIds = useMemo(() => new Set((values || []).map(normalize).filter(Boolean)), [values]);

  const selectedUsers = useMemo(
    () => normalizedUsers.filter(u => selectedIds.has(normalize(u._idNorm))),
    [normalizedUsers, selectedIds]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalizedUsers;
    return normalizedUsers.filter(u => {
      const name = displayNameForUser(u).toLowerCase();
      const email = (u?.email || '').toLowerCase();
      const username = (u?.username || '').toLowerCase();
      return name.includes(q) || email.includes(q) || username.includes(q);
    });
  }, [normalizedUsers, query]);

  const toggleUser = (user) => {
    const id = normalize(user?._idNorm);
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const removeUser = (id) => {
    const next = new Set(selectedIds);
    next.delete(normalize(id));
    onChange(Array.from(next));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-colors
          bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10"
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {selectedUsers.length === 0 ? (
            <span className="text-sm text-gray-500 dark:text-gray-400">{placeholder}</span>
          ) : (
            selectedUsers.slice(0, 3).map(u => (
              <span
                key={u._idNorm}
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10"
              >
                <Avatar user={u} size={20} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 max-w-[140px] truncate">{displayNameForUser(u)}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeUser(u._idNorm); }}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              </span>
            ))
          )}
          {selectedUsers.length > 3 ? (
            <span className="text-xs text-gray-500 dark:text-gray-400">+{selectedUsers.length - 3} more</span>
          ) : null}
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-xl overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-primary/20 transition-all
                  bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-800 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">No results</div>
            ) : (
              filtered.map(u => (
                <OptionRow
                  key={u._idNorm}
                  user={u}
                  selected={selectedIds.has(normalize(u._idNorm))}
                  onSelect={toggleUser}
                />
              ))
            )}
          </div>

          <div className="p-2 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Selected: {selectedUsers.length}</div>
            <button
              type="button"
              onClick={() => { setOpen(false); setQuery(''); }}
              className="px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const userDisplay = displayNameForUser;
export const userInitials = initialsForUser;
export const userAvatarGradient = colorForId;
