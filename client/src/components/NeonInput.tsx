import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const NeonInput = forwardRef<HTMLInputElement, NeonInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neon-cyan mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'input-neon w-full px-4 py-2 rounded-sm',
            error && 'border-neon-red',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-neon-red text-sm mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-text-tertiary text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

NeonInput.displayName = 'NeonInput';

export { NeonInput };
