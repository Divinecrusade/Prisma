// src/components/ConfirmModal.tsx
import React from 'react';
import { Button } from '@untitledui/base/buttons/button';
import { AlertTriangle } from '@untitledui/icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, onClose, onConfirm, itemName, isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/70" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-error-100 p-3">
              <AlertTriangle className="h-6 w-6 text-error-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-2xl text-center text-text-lg font-semibold text-gray-900">
            Удалить {itemName}?
          </h2>

          {/* Message */}
          <p className="mb-6 text-center text-text-sm text-gray-600">
            Это действие невозможно отменить
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button color="secondary" size="md" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button color="primary-destructive" size="md" onClick={onConfirm} disabled={isLoading} className="flex-1">
              {isLoading ? 'Удаление...' : 'Да, удалить'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;