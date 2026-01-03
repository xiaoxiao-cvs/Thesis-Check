import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/cn';

const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('card', className)} {...props}>
    {children}
  </div>
));

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('card-header', className)} {...props}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn('card-title', className)} {...props}>
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn('card-description', className)} {...props}>
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('card-content', className)} {...props}>
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('card-footer', className)} {...props}>
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

CardHeader.propTypes = Card.propTypes;
CardTitle.propTypes = Card.propTypes;
CardDescription.propTypes = Card.propTypes;
CardContent.propTypes = Card.propTypes;
CardFooter.propTypes = Card.propTypes;

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
