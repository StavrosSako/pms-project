import React, { useState, useEffect, useRef } from 'react';
import { Bell, UserPlus, CheckCircle2, ClipboardList, Loader2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationDropdown() {
  const {
    isAdmin,
    loading,
    error,
    pendingUsers,
    unreadAssignedTasks,
    badgeCount,
    activatingId,
    rejectingId,
    refreshPendingUsers,
    refreshAssignedTasks,
    activatePendingUser,
    rejectPendingUser,
    markAssignmentsAsRead
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  const hasBadge = badgeCount > 0;
  const badgeText = badgeCount > 9 ? '9+' : `${badgeCount}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            if (isAdmin) refreshPendingUsers();
            else refreshAssignedTasks();
          }
        }}
        className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-white/10"
      >
        <Bell size={20} />
        {hasBadge && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] leading-[18px] font-bold text-white bg-red-500 rounded-full text-center border-2 border-surface dark:border-[#0f172a]">
            {badgeText}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[360px] bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                {isAdmin ? 'Pending registrations' : 'New task assignments'}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">{badgeCount}</span>
                {!isAdmin && (
                  <button
                    type="button"
                    onClick={markAssignmentsAsRead}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 flex justify-center items-center">
                <Loader2 className="animate-spin text-primary" size={20} />
              </div>
            ) : error ? (
              <div className="p-4 text-red-600 dark:text-red-300 text-sm">
                {error}
              </div>
            ) : isAdmin ? (
              pendingUsers.length > 0 ? (
                pendingUsers.map(pUser => (
                  <div key={pUser.id} className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/10 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <UserPlus size={20} className="text-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{pUser.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{pUser.email}</p>
                        <p className={`text-[11px] ${pUser.role === 'ADMIN' ? 'text-red-600 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          Requested role: <span className="font-semibold">{pUser.role}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => rejectPendingUser(pUser.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-300 transition-colors disabled:opacity-60"
                        disabled={!!activatingId || !!rejectingId}
                      >
                        {rejectingId === pUser.id ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="animate-spin" size={14} />
                            Rejecting
                          </span>
                        ) : (
                          'Reject'
                        )}
                      </button>

                      <button
                        onClick={() => activatePendingUser(pUser.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
                        disabled={!!activatingId || !!rejectingId}
                      >
                        {activatingId === pUser.id ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="animate-spin" size={14} />
                            Activating
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 size={14} />
                            Accept
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No new notifications.
                </div>
              )
            ) : (
              unreadAssignedTasks.length > 0 ? (
                unreadAssignedTasks.map(task => {
                  const assignedAtLabel = task.__assignedAtMs
                    ? new Date(task.__assignedAtMs).toLocaleString()
                    : '';

                  return (
                    <div key={task._id || task.id} className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/10 last:border-b-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <ClipboardList size={20} className="text-primary" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{task.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {assignedAtLabel}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                        {task.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No new assignments.
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

