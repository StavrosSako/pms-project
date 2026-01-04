import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Calendar, Users } from 'lucide-react';
import { Modal } from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.jsx';
import { useProjects } from '../hooks/useProjects.js';
import { useTeam } from '../hooks/useTeam.js';

const getTaskId = (task) => task?.id || task?._id;

const EditTaskModal = ({ updateTask }) => {
  const { modalProps } = useModal();
  const task = modalProps.task;

  const { projects, loading: projectsLoading } = useProjects();
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setTitle(task?.title || '');
    setDescription(task?.description || '');
    setPriority(task?.priority || 'Medium');
    setTeamId(task?.teamId || '');
    setAssignees((task?.assignees || []).map(a => a.userId));
    setDueDate(task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '');
    setError(null);
    setLoading(false);
    setShowAdvanced(false);
  }, [task]);

  const handleSubmit = async () => {
    if (!taskId) return { success: false };

    setLoading(true);
    setError(null);

    if (!title.trim() || !teamId) {
      setError('Task title and Project are required.');
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

  const isLoading = loading || projectsLoading || usersLoading;

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
      size="md"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg font-medium bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
          autoFocus
        />

        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-gray-700 dark:text-gray-300"
          disabled={projectsLoading}
        >
          <option value="">Select project...</option>
          {projects.map(project => (
            <option key={project.id || project._id} value={project.id || project._id}>
              {project.name}
            </option>
          ))}
        </select>

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

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            {showAdvanced ? 'Less options' : 'More options'}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/5">
            <textarea
              rows="2"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-300 resize-none"
            />

            <div className="flex items-center gap-2">
              <Users size={14} className="text-gray-400" />
              <select
                multiple
                value={assignees}
                onChange={(e) => setAssignees(Array.from(e.target.selectedOptions, opt => opt.value))}
                className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none text-gray-700 dark:text-gray-300 max-h-20"
                disabled={usersLoading}
              >
                {allUsers.map(user => (
                  <option key={user.id || user._id} value={user.id || user._id}>
                    {user.username || user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

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
