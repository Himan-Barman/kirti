import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'red' | 'gold' | 'dark' | 'gray' | 'outline';
  size?: 'sm' | 'md';
  rounded?: 'sm' | 'md' | 'full';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  rounded = 'full',
  icon,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`ui-badge badge-${variant} badge-size-${size} badge-rounded-${rounded} ${className}`}
      {...props}
    >
      {icon && <span className="badge-icon">{icon}</span>}
      <span>{children}</span>

      <style>{`
        .ui-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-sans);
          font-weight: 700;
          letter-spacing: -0.01em;
          white-space: nowrap;
          user-select: none;
        }

        /* Sizes */
        .badge-size-sm {
          padding: 2px 7px;
          font-size: 11px;
        }
        .badge-size-md {
          padding: 4px 10px;
          font-size: 12px;
        }

        /* Rounded */
        .badge-rounded-sm { border-radius: var(--radius-xs); }
        .badge-rounded-md { border-radius: var(--radius-sm); }
        .badge-rounded-full { border-radius: var(--radius-full); }

        /* Variants */
        .badge-red {
          background-color: var(--kirti-red-soft);
          color: var(--kirti-red);
        }
        .badge-gold {
          background-color: var(--kirti-gold-soft);
          color: var(--kirti-gold);
        }
        .badge-dark {
          background-color: var(--text-primary);
          color: var(--bg-app);
        }
        .badge-gray {
          background-color: var(--badge-bg-gray);
          color: var(--badge-text-gray);
        }
        .badge-outline {
          background-color: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .badge-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </span>
  );
};
