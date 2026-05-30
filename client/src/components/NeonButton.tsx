import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'pink' | 'cyan' | 'dual';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ variant = 'pink', size = 'md', loading = false, className, children, disabled, ...props }, ref) => {
    const variantClasses = {
      pink: 'btn-neon-pink',
      cyan: 'btn-neon-cyan',
      dual: 'bg-gradient-to-r from-neon-pink to-neon-cyan text-bg-deep-black border-2 border-neon-cyan font-bold uppercase tracking-wider',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          'rounded-sm transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

NeonButton.displayName = 'NeonButton';

export { NeonButton };
