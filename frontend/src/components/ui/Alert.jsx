import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className 
}) => {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-green-800 dark:text-green-300',
      message: 'text-green-700 dark:text-green-400',
      IconComponent: CheckCircle,
    },
    error: {
      container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-800 dark:text-red-300',
      message: 'text-red-700 dark:text-red-400',
      IconComponent: XCircle,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-300',
      message: 'text-yellow-700 dark:text-yellow-400',
      IconComponent: AlertCircle,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-300',
      message: 'text-blue-700 dark:text-blue-400',
      IconComponent: Info,
    },
  };

  const style = styles[type];
  const Icon = style.IconComponent;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-4',
        style.container,
        className
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', style.icon)} />
      <div className="flex-1">
        {title && (
          <h5 className={cn('font-medium mb-1', style.title)}>{title}</h5>
        )}
        {message && (
          <p className={cn('text-sm', style.message)}>{message}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded',
            style.icon
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default Alert;
