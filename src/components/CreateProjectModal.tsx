import React, { useState } from 'react';
import { Button } from '@untitledui/base/buttons/button';
import { XClose } from '@untitledui/icons';
import { projectsApi, type ResearchProject } from '../api';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: ResearchProject) => void;
}

interface FormErrors {
  name?: string;
  description?: string;
  submit?: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isHidden, setIsHidden] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const newProject = await projectsApi.create({
        name: name.trim(),
        description: description.trim(),
        is_hidden: isHidden,
      });
      
      onProjectCreated?.(newProject);
      handleClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      setErrors({ submit: 'Failed to create project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setIsHidden(true);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

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
            <h2 className="text-text-lg font-semibold text-gray-900">Создать новую папку</h2>
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
              <div className="text-left">
                <label htmlFor="project-name" className="mb-1.5 block text-text-sm font-medium text-gray-700">
                  Project Name <span className="text-error-500">*</span>
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите название для папки с изображениями"
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
              <div className="text-left">
                <label htmlFor="project-description" className="mb-1.5 block text-text-sm font-medium text-gray-700">
                  Описание <span className="text-error-500">*</span>
                </label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Оставьте комментарий, описывающий содержимое папки..."
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

              {/* isHidden toggle */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div className="text-left">
                  <p className="text-text-sm font-medium text-gray-700">Скрыть от пользователей</p>
                  <p className="text-text-sm text-gray-500">Пользователи не смогут оставлять аннотации к изображениям в папке, пока вы не откроете доступ</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isHidden}
                  onClick={() => setIsHidden(!isHidden)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                    isHidden ? 'bg-brand-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                      isHidden ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <Button color="secondary" size="md" onClick={handleClose} type="button">
                Отмена
              </Button>
              <Button color="primary" size="md" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Создание...' : 'Создать папку'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
