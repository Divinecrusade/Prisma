import React, { useState, useEffect, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@untitledui/base/buttons/button';
import { XClose, UploadCloud01, Trash01 } from '@untitledui/icons';

interface EditImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: string;
    name: string;
    question: string;
    url: string;
  } | null;
  projectId: string;
}

interface FormErrors {
  name?: string;
  question?: string;
  file?: string;
}

const EditImageModal: React.FC<EditImageModalProps> = ({ isOpen, onClose, image, projectId }) => {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when image changes
  useEffect(() => {
    if (image) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(image.name);
      setQuestion(image.question);
      setCurrentImageUrl(image.url);
      setFile(null);
      setPreview(null);
    }
  }, [image]);

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

  const handleRemoveNewFile = () => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !image) return;

    setIsSubmitting(true);

    // Prepare update data
    const updateData = {
      id: image.id,
      projectId,
      name: name.trim(),
      question: question.trim(),
      hasNewImage: !!file,
    };

    console.log('=== Update Image Data (JSON metadata) ===');
    console.log(JSON.stringify(updateData, null, 2));
    
    if (file) {
      console.log('');
      console.log('=== New File Info ===');
      console.log({
        fileName: file.name,
        fileType: file.type,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      });
      console.log('');
      console.log('=== FormData would contain ===');
      console.log('- metadata: JSON string with update data');
      console.log('- image: File blob (new image)');
    } else {
      console.log('');
      console.log('=== No new image file ===');
      console.log('Only metadata will be updated');
    }
    console.log('=========================================');

    // Reload page after short delay to show the console output
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleClose = () => {
    setErrors({});
    setFile(null);
    setPreview(null);
    onClose();
  };

  if (!isOpen || !image) return null;

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
            <h2 className="text-text-lg font-semibold text-gray-900">Edit Image</h2>
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
              {/* Name field */}
              <div>
                <label htmlFor="image-name" className="mb-1.5 block text-text-sm font-medium text-gray-700">
                  Image Name <span className="text-error-500">*</span>
                </label>
                <input
                  id="image-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter image name"
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
              <div>
                <label htmlFor="image-question" className="mb-1.5 block text-text-sm font-medium text-gray-700">
                  Question for Reviewers <span className="text-error-500">*</span>
                </label>
                <textarea
                  id="image-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like reviewers to evaluate?"
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

              {/* Current image preview */}
              <div>
                <label className="mb-1.5 block text-text-sm font-medium text-gray-700">
                  Current Image
                </label>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentImageUrl || ''}
                      alt="Current"
                      className="h-20 w-20 rounded-lg border border-gray-100 bg-gray-50 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNGMkYyRjIiLz48cGF0aCBkPSJNMzIgMzZDMzIgMzMuNzkgMzMuNzkgMzIgMzYgMzJINDRDNDYuMjEgMzIgNDggMzMuNzkgNDggMzZWNDRDNDggNDYuMjEgNDYuMjEgNDggNDQgNDhIMzZDMzMuNzkgNDggMzIgNDYuMjEgMzIgNDRWMzZaIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTM2IDQwSDM2LjAxIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTQ4IDQ0TDQyIDM4TDM2IDQ0IiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-text-sm font-medium text-gray-900">Currently uploaded</p>
                      <p className="truncate text-text-xs text-gray-500">{currentImageUrl}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* New file upload */}
              <div>
                <label className="mb-1.5 block text-text-sm font-medium text-gray-700">
                  Replace Image <span className="text-text-xs text-gray-400">(optional)</span>
                </label>
                
                {!preview ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
                      isDragOver
                        ? 'border-brand-500 bg-brand-50'
                        : errors.file
                        ? 'border-error-300 bg-error-25'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      <UploadCloud01 className="h-4 w-4 text-gray-600" />
                    </div>
                    <p className="text-text-sm text-gray-600">
                      <span className="font-semibold text-brand-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="mt-0.5 text-text-xs text-gray-500">
                      PNG, JPG, GIF or WebP (max. 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-lg border border-gray-200 p-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={preview}
                        alt="New preview"
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-text-sm font-medium text-gray-900">
                          {file?.name}
                        </p>
                        <p className="text-text-xs text-gray-500">
                          {file && `${(file.size / 1024).toFixed(2)} KB`}
                        </p>
                        <p className="mt-1 text-text-xs font-medium text-brand-600">
                          New image (will replace current)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveNewFile}
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

export default EditImageModal;
