import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/cn';

const Badge = React.forwardRef(({ 
  className, 
  variant = 'default', 
  children, 
  ...props 
}, ref) => {
  const variantStyles = {
    default: 'badge-default',
    secondary: 'badge-secondary',
    destructive: 'badge-destructive',
    outline: 'badge-outline',
  };

  return (
    <div
      ref={ref}
      className={cn('badge', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
});

Badge.displayName = 'Badge';

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'secondary', 'destructive', 'outline']),
  children: PropTypes.node,
};

export default Badge;
