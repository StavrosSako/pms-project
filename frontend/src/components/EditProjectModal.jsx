import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.jsx';

const getProjectId = (project) => project?.id || project?._id;

const EditProjectModal = ({ updateProject, deleteProject }) => {
  const { modalProps, closeModal } = useModal();
  const project = modalProps.project;

  const projectId = useMemo(() => getProjectId(project), [project]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(project?.name || project?.title || '');
    setDescription(project?.description || '');
    setStatus(project?.status || 'Active');
    setProgress(typeof project?.progress === 'number' ? project.progress : 0);
    setError(null);
    setLoading(false);
  }, [project]);

  const handleSubmit = async () => {
    if (!projectId) return { success: false };

    setLoading(true);
    setError(null);

    if (!name.trim()) {
      setError('Project name is required.');
      setLoading(false);
      return { success: false };
    }

    const payload = {
      name,
      description,
      status,
      progress
    };

    const result = await updateProject(projectId, payload);

    if (!result.success) {
      setError(result.error || 'Failed to update project.');
      setLoading(false);
      return { success: false };
    }

    setLoading(false);
    return { success: true };
  };

  const handleDelete = async () => {
    if (!projectId) return;

    const ok = window.confirm('Delete this project? This cannot be undone.');
    if (!ok) return;

    setLoading(true);
    setError(null);

    const result = await deleteProject(projectId);

    if (!result.success) {
      setError(result.error || 'Failed to delete project.');
      setLoading(false);
      return;
    }

    setLoading(false);
    closeModal();
  };

  const isLoading = loading;

  const statusOptions = [
    { value: 'Active' },
    { value: 'In Progress' },
    { value: 'Completed' },
    { value: 'On Hold' }
  ];

  return (
    <Modal
      id="editProject"
      title={modalProps.title || 'Edit Project'}
      onConfirm={handleSubmit}
      confirmText={isLoading ? <><Loader2 className="animate-spin mr-2" size={16} /> Saving...</> : 'Save'}
      showCancel={!isLoading}
      size="sm"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <input
          type="text"
          placeholder="Project name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-lg font-medium bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-gray-700 dark:text-gray-300"
            disabled={isLoading}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.value}</option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-gray-700 dark:text-gray-300"
            disabled={isLoading}
          />
        </div>

        <textarea
          rows="2"
          placeholder="Add a description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-300 resize-none"
          disabled={isLoading}
        />

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait…' : 'Delete project'}
          </button>

          <div className="text-xs text-gray-400">
            {projectId ? `ID: ${projectId}` : ''}
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

export default EditProjectModal;
