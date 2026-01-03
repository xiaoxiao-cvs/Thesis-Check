import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/utils/cn';

const Table = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    >
      {children}
    </table>
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props}>
    {children}
  </thead>
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef(({ className, children, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  >
    {children}
  </tbody>
));
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef(({ className, children, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  >
    {children}
  </tr>
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef(({ className, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  >
    {children}
  </th>
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef(({ className, children, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  >
    {children}
  </td>
));
TableCell.displayName = 'TableCell';

Table.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

TableHeader.propTypes = Table.propTypes;
TableBody.propTypes = Table.propTypes;
TableRow.propTypes = Table.propTypes;
TableHead.propTypes = Table.propTypes;
TableCell.propTypes = Table.propTypes;

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
