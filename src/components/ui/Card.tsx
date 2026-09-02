import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'interactive' | 'outline' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  className = '',
  ...props
}) => {
  const isInteractive = variant === 'interactive';

  return (
    <div
      className={`ui-card card-${variant} card-pad-${padding} card-rounded-${rounded} ${isInteractive ? 'beam-interactive' : ''} ${className}`}
      {...props}
    >
      {children}

      <style>{`
        .ui-card {
          background: var(--bg-card);
          box-shadow: var(--shadow-sm);
          position: relative;
        }

        /* Padding */
        .card-pad-none { padding: 0; }
        .card-pad-sm { padding: 12px; }
        .card-pad-md { padding: 20px; }
        .card-pad-lg { padding: 28px; }

        /* Rounded */
        .card-rounded-sm { border-radius: var(--radius-sm); }
        .card-rounded-md { border-radius: var(--radius-md); }
        .card-rounded-lg { border-radius: var(--radius-lg); }
        .card-rounded-xl { border-radius: var(--radius-xl); }
        .card-rounded-2xl { border-radius: var(--radius-2xl); }
        .card-rounded-full { border-radius: var(--radius-full); }

        /* Variants */
        .card-default {
          background: var(--bg-card);
        }
        .card-subtle {
          background: var(--bg-card-subtle);
        }
        .card-outline {
          background: transparent;
        }
        .card-flat {
          background: var(--bg-card);
          box-shadow: none;
        }
        .card-interactive {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
