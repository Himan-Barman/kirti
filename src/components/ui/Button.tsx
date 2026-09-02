import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'dark' | 'outline' | 'visited' | 'subtle' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'outline',
  size = 'md',
  rounded = 'md',
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`ui-btn btn-${variant} btn-size-${size} btn-rounded-${rounded} ${fullWidth ? 'btn-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-icon-left">{icon}</span>}
      {children && <span className="btn-label">{children}</span>}
      {iconRight && <span className="btn-icon-right">{iconRight}</span>}

      <style>{`
        .ui-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
          white-space: nowrap;
          user-select: none;
          position: relative;
          outline: none;
        }
        .ui-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .ui-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-full {
          width: 100%;
        }

        /* Sizes */
        .btn-size-sm {
          padding: 6px 13px;
          font-size: 13px;
          height: 34px;
        }
        .btn-size-md {
          padding: 9px 18px;
          font-size: 14px;
          height: 42px;
        }
        .btn-size-lg {
          padding: 12px 24px;
          font-size: 15px;
          height: 48px;
        }

        /* Rounded */
        .btn-rounded-sm {
          border-radius: var(--radius-sm);
        }
        .btn-rounded-md {
          border-radius: var(--radius-md);
        }
        .btn-rounded-lg {
          border-radius: var(--radius-lg);
        }
        .btn-rounded-xl {
          border-radius: var(--radius-xl);
        }
        .btn-rounded-full {
          border-radius: var(--radius-full);
        }

        /* Variants */
        .btn-primary {
          background-color: var(--kirti-red);
          color: #ffffff;
          border-color: var(--kirti-red);
          box-shadow: 0 2px 10px rgba(180, 35, 42, 0.28);
        }
        .btn-primary:hover:not(:disabled) {
          background-color: var(--kirti-red-hover);
          border-color: var(--kirti-red-hover);
          box-shadow: 0 4px 14px rgba(180, 35, 42, 0.38);
        }

        .btn-dark {
          background-color: var(--text-primary);
          color: var(--bg-app);
          border-color: var(--text-primary);
        }
        .btn-dark:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn-outline {
          background-color: var(--bg-card);
          color: var(--text-primary);
          border-color: var(--border);
        }
        .btn-outline:hover:not(:disabled) {
          background-color: var(--bg-card-subtle);
          border-color: var(--text-muted);
        }

        .btn-visited {
          background-color: var(--kirti-red);
          color: #ffffff;
          border-color: var(--kirti-red);
          box-shadow: 0 2px 8px rgba(180, 35, 42, 0.3);
        }
        .btn-visited:hover:not(:disabled) {
          background-color: var(--kirti-red-hover);
        }

        .btn-subtle {
          background-color: var(--bg-card-subtle);
          color: var(--text-primary);
          border-color: var(--border-subtle);
        }
        .btn-subtle:hover:not(:disabled) {
          background-color: var(--bg-card-hover);
          border-color: var(--border);
        }

        .btn-ghost {
          background-color: transparent;
          color: var(--text-secondary);
          border-color: transparent;
        }
        .btn-ghost:hover:not(:disabled) {
          background-color: var(--bg-card-subtle);
          color: var(--text-primary);
        }

        .btn-icon-left, .btn-icon-right {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </button>
  );
};
