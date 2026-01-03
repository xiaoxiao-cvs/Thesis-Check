import { useState } from 'react';
import PropTypes from 'prop-types';
import { Upload, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export const FileUpload = ({ 
  value = [], 
  onChange, 
  accept, 
  maxSize = 10 * 1024 * 1024, // 10MB default
  className,
  disabled = false 
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const file = files[0];
    if (file.size > maxSize) {
      alert(`文件大小不能超过 ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return;
    }
    onChange?.([file]);
  };

  const handleRemove = () => {
    onChange?.([]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      {value.length === 0 ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            dragActive 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 dark:border-gray-600 hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="hidden"
            id="file-upload"
            onChange={handleChange}
            accept={accept}
            disabled={disabled}
          />
          
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              拖拽文件到这里，或{' '}
              <span className="text-primary hover:text-primary/80">点击上传</span>
            </span>
          </label>
          
          {accept && (
            <p className="text-xs text-gray-500 mt-2">
              支持格式: {accept}
            </p>
          )}
          {maxSize && (
            <p className="text-xs text-gray-500">
              最大文件大小: {(maxSize / 1024 / 1024).toFixed(0)}MB
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <Upload className="h-8 w-8 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {value[0].name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(value[0].size)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
  accept: PropTypes.string,
  maxSize: PropTypes.number,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};
