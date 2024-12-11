import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}: ConfirmationDialogProps) {
  const colors = {
    danger: {
      header: 'bg-gradient-to-br from-rose-500 to-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700'
    },
    warning: {
      header: 'bg-gradient-to-br from-amber-500 to-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700'
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        <div className={`${colors[type].header} px-6 py-4 text-white`}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              {title}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <p className="text-slate-600 text-sm">{description}</p>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[100px] px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`min-w-[100px] px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${colors[type].button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}