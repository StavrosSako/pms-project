import React, { useState, useEffect } from 'react';
import { useModal } from '../hooks/useModal.jsx';
import { Modal } from '../components/Modal.jsx';
import { Loader2, Calendar, Users } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useTeam } from '../hooks/useTeam';

const CreateTaskModal = ({ createTask }) => {
  const { modalProps, closeModal } = useModal();
  const initialStatus = modalProps.initialStatus || 'TODO';

  const { projects, loading: projectsLoading } = useProjects();
  const { members: allUsers, loading: usersLoading } = useTeam();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('Medium');
  const [teamId, setTeamId] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setStatus(initialStatus);
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setTeamId('');
    setAssignees([]);
    setDueDate('');
    setError(null);
    setShowAdvanced(false);
  }, [initialStatus, modalProps]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!title.trim() || !teamId) {
      setError('Task title and Project are required.');
      setLoading(false);
      return { success: false };
    }

    const taskData = {
      title,
      description,
      status,
      priority,
      teamId,
      dueDate: dueDate || null,
      assignees: assignees.map(userId => ({ userId }))
    };

    const result = await createTask(taskData);

    if (result.success) {
      setLoading(false);
      return { success: true };
    } else {
      setError(result.error || 'Failed to create task.');
    }
    setLoading(false);
    return { success: false };
  };

  const isLoading = loading || projectsLoading || usersLoading;

  const priorityOptions = [
    { value: 'Low', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
    { value: 'Medium', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'High', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' }
  ];

  return (
    <Modal 
      id="createTask" 
      title={modalProps.title || "New Task"} 
      onConfirm={handleSubmit} 
      confirmText={isLoading ? <><Loader2 className="animate-spin mr-2" size={16} /> Creating...</> : "Create"} 
      showCancel={!isLoading}
      size="md"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        {/* Task Title - Main Focus */}
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg font-medium bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
          autoFocus
        />

        {/* Project Select - Required */}
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

        {/* Quick Options Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Pills */}
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

          {/* Due Date */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-xs bg-transparent border-none outline-none text-gray-600 dark:text-gray-300"
            />
          </div>

          {/* Toggle Advanced */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            {showAdvanced ? 'Less options' : 'More options'}
          </button>
        </div>

        {/* Advanced Options - Collapsible */}
        {showAdvanced && (
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/5">
            {/* Description */}
            <textarea
              rows="2"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-300 resize-none"
            />

            {/* Assignees */}
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

        {/* Error */}
        {error && (
          <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
