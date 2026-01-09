import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Calendar, Users } from 'lucide-react';
import { Modal } from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.jsx';
import { useTeam } from '../hooks/useTeam.js';
import { UserMultiSelect } from '../components/UserPicker';

const getTaskId = (task) => task?.id || task?._id;

const EditTaskModal = ({ updateTask, deleteTask }) => {
  const { modalProps, closeModal } = useModal();
  const task = modalProps.task;

  const { members: allUsers, loading: usersLoading } = useTeam();

  const taskId = useMemo(() => getTaskId(task), [task]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [teamId, setTeamId] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTitle(task?.title || '');
    setDescription(task?.description || '');
    setPriority(task?.priority || 'Medium');
    setTeamId(task?.teamId || '');
    setAssignees((task?.assignees || []).map(a => a.userId));
    setDueDate(task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '');
    setError(null);
    setLoading(false);
  }, [task]);

  const handleSubmit = async () => {
    if (!taskId) return { success: false };

    setLoading(true);
    setError(null);

    if (!title.trim()) {
      setError('Task title is required.');
      setLoading(false);
      return { success: false };
    }

    const payload = {
      title,
      description,
      priority,
      teamId,
      dueDate: dueDate || null,
      assignees: assignees.map(userId => ({ userId }))
    };

    const result = await updateTask(taskId, payload);

    if (!result.success) {
      setError(result.error || 'Failed to update task.');
      setLoading(false);
      return { success: false };
    }

    setLoading(false);
    return { success: true };
  };

  const handleDelete = async () => {
    if (!taskId) return;

    const ok = window.confirm('Delete this task? This cannot be undone.');
    if (!ok) return;

    setLoading(true);
    setError(null);

    const result = await deleteTask(taskId);

    if (!result.success) {
      setError(result.error || 'Failed to delete task.');
      setLoading(false);
      return;
    }

    setLoading(false);
    closeModal();
  };

  const isLoading = loading;

  const priorityOptions = [
    { value: 'Low', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
    { value: 'Medium', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'High', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' }
  ];

  return (
    <Modal
      id="editTask"
      title={modalProps.title || 'Edit Task'}
      onConfirm={handleSubmit}
      confirmText={isLoading ? <><Loader2 className="animate-spin mr-2" size={16} /> Saving...</> : 'Save'}
      showCancel={!isLoading}
      size="lg"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg font-medium bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
          autoFocus
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-lg">
            {priorityOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  priority === opt.value
                    ? opt.color
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {opt.value}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-xs bg-transparent border-none outline-none text-gray-600 dark:text-gray-300"
            />
          </div>

        </div>

        <div className="space-y-3 pt-1">
          <textarea
            rows="2"
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-300 resize-none"
          />

          <div className="flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <div className="flex-1">
              <UserMultiSelect
                users={allUsers}
                values={assignees}
                onChange={setAssignees}
                disabled={usersLoading}
                placeholder={usersLoading ? 'Loading users...' : 'Assign users...'}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait…' : 'Delete task'}
          </button>

          <div className="text-xs text-gray-400">
            {taskId ? `ID: ${taskId}` : ''}
          </div>
        </div>

        {error && (
          <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default EditTaskModal;
