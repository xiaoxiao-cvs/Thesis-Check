import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/cn';

const Select = React.forwardRef(({ 
  className, 
  children, 
  error,
  ...props 
}, ref) => {
  return (
    <select
      className={cn(
        'select',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  error: PropTypes.bool,
};

export default Select;
