import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/cn';

const Input = React.forwardRef(({ 
  className, 
  type = 'text', 
  error,
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'input',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  error: PropTypes.bool,
};

export default Input;
