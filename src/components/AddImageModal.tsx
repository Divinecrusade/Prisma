import React, { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@untitledui/base/buttons/button';
import { XClose, UploadCloud01, Trash01 } from '@untitledui/icons';
import { imagesApi, type ResearchImage } from '../api';

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onImageAdded?: (image: ResearchImage) => void;
}

interface FormErrors {
  name?: string;
  question?: string;
  file?: string;
  submit?: string;
}

const AddImageModal: React.FC<AddImageModalProps> = ({ isOpen, onClose, projectId, projectName, onImageAdded }) => {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'File must be an image (JPEG, PNG, GIF, or WebP)';
    }
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const fileError = validateFile(selectedFile);
    if (fileError) {
      setErrors(prev => ({ ...prev, file: fileError }));
      return;
    }

    setFile(selectedFile);
    setErrors(prev => ({ ...prev, file: undefined }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Image name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Image name must be at least 2 characters';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Image name must be less than 100 characters';
    }

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    } else if (question.trim().length < 10) {
      newErrors.question = 'Question must be at least 10 characters';
    } else if (question.trim().length > 500) {
      newErrors.question = 'Question must be less than 500 characters';
    }

    if (!file) {
      newErrors.file = 'Please select an image to upload';
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
      const newImage = await imagesApi.create(projectId, {
        name: name.trim(),
        question: question.trim(),
        file: file!,
      });
      
      onImageAdded?.(newImage);
      handleClose();
    } catch (error) {
      console.error('Failed to upload image:', error);
      setErrors({ submit: 'Failed to upload image. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setQuestion('');
    setFile(null);
    setPreview(null);
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
          <div className="flex justify-between border-b border-gray-200 px-6 py-4">
            <div className="text-left">
              <h2 className="text-text-lg font-semibold text-gray-900">Добавить изображение</h2>
              <p className="text-text-sm text-gray-500">{projectName}</p>
            </div>
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
                <label htmlFor="image-name" className="mb-1.5 block text-text-sm font-medium text-gray-700">
                  Название <span className="text-error-500">*</span>
                </label>
                <input
                  id="image-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите название, которое ассоцируется с тестом"
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

              {/* Question field */}
              <div className="text-left">
                <label htmlFor="image-question" className="mb-1.5 block text-text-sm font-medium text-gray-700">
                  Вопрос <span className="text-error-500">*</span>
                </label>
                <textarea
                  id="image-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Какой вопрос хотите задать для этого изображения?"
                  rows={3}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-text-md text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
                    errors.question 
                      ? 'border-error-300 focus:border-error-300 focus:ring-error-100' 
                      : 'border-gray-300 focus:border-brand-300 focus:ring-brand-100'
                  }`}
                />
                {errors.question && (
                  <p className="mt-1.5 text-text-sm text-error-600">{errors.question}</p>
                )}
              </div>

              {/* File upload */}
              <div>
                <label className="text-left mb-1.5 block text-text-sm font-medium text-gray-700">
                  Файл с изображением <span className="text-error-500">*</span>
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleInputChange}
                  className="hidden"
                />

                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-brand-500 bg-brand-50' 
                        : errors.file 
                          ? 'border-error-300 bg-error-25' 
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <UploadCloud01 className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-text-sm font-medium text-gray-700">
                      Выберите файл или перетащите его сюда
                    </p>
                    <p className="mt-1 text-text-xs text-gray-500">
                      PNG, JPG, GIF, WebP (max. 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={preview!}
                        alt="Preview"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-text-sm font-medium text-gray-900">
                          {file?.name}
                        </p>
                        <p className="text-text-xs text-gray-500">
                          {file && `${(file.size / 1024).toFixed(2)} KB`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-error-500"
                      >
                        <Trash01 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {errors.file && (
                  <p className="mt-1.5 text-text-sm text-error-600">{errors.file}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <Button color="secondary" size="md" onClick={handleClose} type="button">
                Отмена
              </Button>
              <Button color="primary" size="md" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Загрузка...' : 'Загрузить изображение'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddImageModal;
