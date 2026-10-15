import { useState, type ReactNode } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Modal } from '@/admin/components/ui/Modal';
import { Button } from '@/admin/components/ui/Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận hành động',
  description = 'Bạn có chắc chắn muốn thực hiện hành động này không? Hành động này có thể không thể hoàn tác.',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = isLoading || internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  const isDestructive = variant === 'destructive';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!loading) onClose();
      }}
      size="sm"
      closeOnOverlayClick={!loading}
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${
            isDestructive
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}
        >
          {isDestructive ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <HelpCircle className="w-6 h-6" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>

        {/* Description */}
        <div className="text-xs text-slate-600 leading-relaxed mb-6">
          {description}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            isLoading={loading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
