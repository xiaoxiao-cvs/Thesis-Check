import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'destructive',
  loading = false
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            variant === 'destructive' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
          }`}>
            <AlertTriangle className={`h-5 w-5 ${
              variant === 'destructive' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
            }`} />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? '处理中...' : confirmText}
        </Button>
      </div>
    </Modal>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['destructive', 'default']),
  loading: PropTypes.bool,
};

export default ConfirmDialog;
