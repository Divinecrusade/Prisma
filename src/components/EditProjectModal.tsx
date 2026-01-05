import React, { useState, useEffect } from 'react';
import { Button } from '@untitledui/base/buttons/button';
import { XClose } from '@untitledui/icons';
import { projectsApi, type ResearchProject } from '../api';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description: string;
  } | null;
  onProjectUpdated?: (project: ResearchProject) => void;
}

interface FormErrors {
  name?: string;
  description?: string;
  submit?: string;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, project, onProjectUpdated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when project changes
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
    }
  }, [project]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Project name must be less than 100 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !project) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const updatedProject = await projectsApi.update(project.id, {
        name: name.trim(),
        description: description.trim(),
      });
      
      onProjectUpdated?.(updatedProject);
      handleClose();
    } catch (error) {
      console.error('Failed to update project:', error);
      setErrors({ submit: 'Failed to update project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/70 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-lg transform rounded-xl bg-white shadow-xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-text-lg font-semibold text-gray-900">Edit Project</h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <XClose className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-5">
              {/* Submit error */}
              {errors.submit && (
                <div className="rounded-lg bg-error-50 p-3 text-text-sm text-error-700">
                  {errors.submit}
                </div>
              )}

              {/* Name field */}
              <div>
                <label htmlFor="project-name" className="mb-1.5 block text-text-sm font-medium text-gray-700">
                  Project Name <span className="text-error-500">*</span>
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-text-md text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                    errors.name 
                      ? 'border-error-300 focus:border-error-300 focus:ring-error-100' 
                      : 'border-gray-300 focus:border-brand-300 focus:ring-brand-100'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-text-sm text-error-600">{errors.name}</p>
                )}
              </div>

              {/* Description field */}
              <div>
                <label htmlFor="project-description" className="mb-1.5 block text-text-sm font-medium text-gray-700">
                  Description <span className="text-error-500">*</span>
                </label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your research project..."
                  rows={4}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-text-md text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                    errors.description 
                      ? 'border-error-300 focus:border-error-300 focus:ring-error-100' 
                      : 'border-gray-300 focus:border-brand-300 focus:ring-brand-100'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1.5 text-text-sm text-error-600">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <Button color="secondary" size="md" onClick={handleClose} type="button">
                Cancel
              </Button>
              <Button color="primary" size="md" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;
