import React, { useState, useEffect } from 'react';
import { useModal } from '../hooks/useModal.jsx';
import { Modal } from '../components/Modal.jsx';
import { Loader2 } from 'lucide-react';

const CreateProjectModal = ({ createProject }) => {
  const { modalProps, closeModal } = useModal();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setProjectName('');
    setProjectDescription('');
    setStatus('Active');
    setError(null);
  }, [modalProps]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!projectName.trim()) {
      setError('Project name is required.');
      setLoading(false);
      return { success: false };
    }

    const result = await createProject({
      name: projectName,
      description: projectDescription,
      status,
      progress: 0
    });

    if (result.success) {
      setProjectName('');
      setProjectDescription('');
      setLoading(false);
      return { success: true };
    } else {
      setError(result.error || 'Failed to create project.');
    }
    setLoading(false);
    return { success: false };
  };

  const statusOptions = [
    { value: 'Active', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { value: 'In Progress', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'On Hold', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' }
  ];

  return (
    <Modal 
      id="createProject" 
      title={modalProps.title || "New Project"} 
      onConfirm={handleSubmit} 
      confirmText={loading ? <><Loader2 className="animate-spin mr-2" size={16} /> Creating...</> : "Create"} 
      showCancel={!loading}
      size="sm"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        {/* Project Name - Main Focus */}
        <input
          type="text"
          placeholder="Project name..."
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full text-lg font-medium bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
          autoFocus
        />

        {/* Status Pills */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-lg w-fit">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                status === opt.value 
                  ? opt.color 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {opt.value}
            </button>
          ))}
        </div>

        {/* Description - Optional */}
        <textarea
          rows="2"
          placeholder="Add a description (optional)..."
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-300 resize-none"
        />

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

export default CreateProjectModal;
