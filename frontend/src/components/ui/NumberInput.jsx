import PropTypes from 'prop-types';
import { cn } from '@/utils/cn';

const NumberInput = ({ 
  className, 
  min, 
  max, 
  step = 1,
  value,
  onChange,
  placeholder,
  disabled = false,
  ...props 
}) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onChange?.(undefined);
      return;
    }
    
    const numVal = parseFloat(val);
    if (isNaN(numVal)) return;
    
    if (min !== undefined && numVal < min) return;
    if (max !== undefined && numVal > max) return;
    
    onChange?.(numVal);
  };

  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm",
        "placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
        "dark:placeholder:text-gray-500",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
};

NumberInput.propTypes = {
  className: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

export default NumberInput;
