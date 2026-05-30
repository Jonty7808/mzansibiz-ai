import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface HudPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

const HudPanel = forwardRef<HTMLDivElement, HudPanelProps>(
  ({ title, subtitle, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative bg-bg-dark-gray border-2 border-neon-cyan rounded-sm p-6',
          'box-shadow: 0 0 10px rgba(0, 217, 255, 0.2), inset 0 0 5px rgba(0, 217, 255, 0.05)',
          'before:absolute before:top-0 before:left-0 before:w-3 before:h-3 before:border-t-2 before:border-l-2 before:border-neon-cyan',
          'after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3 after:border-b-2 after:border-r-2 after:border-neon-cyan',
          className
        )}
        {...props}
      >
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-glow-cyan">{title}</h3>
            {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    );
  }
);

HudPanel.displayName = 'HudPanel';

export { HudPanel };
