import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface NeonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'cyan' | 'pink' | 'dual';
  children: React.ReactNode;
}

const NeonCard = forwardRef<HTMLDivElement, NeonCardProps>(
  ({ variant = 'cyan', className, children, ...props }, ref) => {
    const variantClasses = {
      cyan: 'border-glow-cyan',
      pink: 'border-glow-pink',
      dual: 'border-2 border-neon-cyan box-shadow: 0 0 15px rgba(0, 217, 255, 0.3), 0 0 20px rgba(255, 20, 147, 0.2)',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'card-neon',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeonCard.displayName = 'NeonCard';

export { NeonCard };
