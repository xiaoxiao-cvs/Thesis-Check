import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/cn';

const Label = React.forwardRef(({ className, children, ...props }, ref) => (
  <label ref={ref} className={cn('label', className)} {...props}>
    {children}
  </label>
));

Label.displayName = 'Label';

Label.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Label;
