import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { subscribeSse } from '../api/sseClient';
import { userService } from '../api/userService';
import { taskService } from '../api/taskService';

export const useNotifications = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';
  const token = useMemo(() => localStorage.getItem('token'), [user?.id]);
  const lastSeenKey = user?.id ? `notif:lastSeenAssignmentAt:${user.id}` : null;

  const [pendingUsers, setPendingUsers] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activatingId, setActivatingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [lastSeenAssignmentAt, setLastSeenAssignmentAt] = useState(0);

  const getAssignedAtMsForUser = (task) => {
    const entry = task?.assignees?.find(a => a?.userId === user?.id);
    const value = entry?.assignedAt;
    const ms = value ? new Date(value).getTime() : 0;
    return Number.isFinite(ms) ? ms : 0;
  };

  const refreshPendingUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const list = await userService.getPendingUsers();
      setPendingUsers(list);
    } catch (err) {
      setError('Failed to load pending requests.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAssignedTasks = async () => {
    if (!user?.id || isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const tasks = await taskService.getAllTasks({ userId: user.id });
      const normalized = (tasks || [])
        .map(t => ({
          ...t,
          __assignedAtMs: getAssignedAtMsForUser(t)
        }))
        .sort((a, b) => (b.__assignedAtMs || 0) - (a.__assignedAtMs || 0));

      setAssignedTasks(normalized);
    } catch (err) {
      setError('Failed to load task assignments.');
      setAssignedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const activatePendingUser = async (userId) => {
    if (!isAdmin) return;
    setActivatingId(userId);
    setError(null);
    try {
      await userService.activateUser(userId);
      await refreshPendingUsers();
    } catch (err) {
      setError('Failed to activate user.');
    } finally {
      setActivatingId(null);
    }
  };

  const rejectPendingUser = async (userId) => {
    if (!isAdmin) return;
    setRejectingId(userId);
    setError(null);
    try {
      await userService.rejectPendingUser(userId);
      await refreshPendingUsers();
    } catch (err) {
      setError('Failed to reject user.');
    } finally {
      setRejectingId(null);
    }
  };

  const markAssignmentsAsRead = () => {
    if (!lastSeenKey) return;
    const now = Date.now();
    localStorage.setItem(lastSeenKey, `${now}`);
    setLastSeenAssignmentAt(now);
  };

  useEffect(() => {
    if (!user) return;

    if (!isAdmin) {
      const initial = lastSeenKey ? Number(localStorage.getItem(lastSeenKey) || 0) : 0;
      setLastSeenAssignmentAt(Number.isFinite(initial) ? initial : 0);
    }

    if (isAdmin) refreshPendingUsers();
    else refreshAssignedTasks();
  }, [user?.id, isAdmin, lastSeenKey]);

  useEffect(() => {
    if (!user || !token) return;

    if (isAdmin) {
      const unsubscribe = subscribeSse({
        url: 'http://localhost:8080/api/notifications/stream',
        token,
        onEvent: (evt) => {
          if (evt.event === 'pending_created' || evt.event === 'pending_resolved') {
            refreshPendingUsers();
          }
        },
        onError: () => {
          // Keep silent; refresh still possible from UI
        }
      });

      return () => unsubscribe();
    }

    const unsubscribe = subscribeSse({
      url: 'http://localhost:8083/api/notifications/stream',
      token,
      onEvent: (evt) => {
        if (evt.event !== 'task_assigned') return;

        const assignedAtMs = evt.data?.assignedAt ? new Date(evt.data.assignedAt).getTime() : Date.now();
        const payload = {
          id: evt.data?.taskId,
          title: evt.data?.title,
          status: evt.data?.status,
          teamId: evt.data?.teamId,
          __assignedAtMs: Number.isFinite(assignedAtMs) ? assignedAtMs : Date.now()
        };

        setAssignedTasks(prev => [payload, ...(prev || [])]);
      },
      onError: () => {
        // Keep silent; refresh still possible from UI
      }
    });

    return () => unsubscribe();
  }, [user?.id, token, isAdmin]);

  const unreadAssignedTasks = isAdmin
    ? []
    : (assignedTasks || []).filter(t => (t.__assignedAtMs || 0) > (lastSeenAssignmentAt || 0));

  const badgeCount = isAdmin ? (pendingUsers?.length || 0) : unreadAssignedTasks.length;

  return {
    isAdmin,
    loading,
    error,
    pendingUsers,
    assignedTasks,
    unreadAssignedTasks,
    badgeCount,
    activatingId,
    rejectingId,
    refreshPendingUsers,
    refreshAssignedTasks,
    activatePendingUser,
    rejectPendingUser,
    markAssignmentsAsRead
  };
};
