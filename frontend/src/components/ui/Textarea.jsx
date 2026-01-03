import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/cn';

const Textarea = React.forwardRef(({ 
  className, 
  error,
  ...props 
}, ref) => {
  return (
    <textarea
      className={cn(
        'textarea',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  className: PropTypes.string,
  error: PropTypes.bool,
};

export default Textarea;
