import React from 'react';
import { Search, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  rounded = 'md',
  className = '',
  ...props
}) => {
  return (
    <div className="ui-input-group">
      {label && <label className="ui-input-label">{label}</label>}
      <div className={`ui-input-wrap rounded-${rounded} ${error ? 'has-error' : ''}`}>
        {icon && <span className="ui-input-icon">{icon}</span>}
        <input className={`ui-input-field ${className}`} {...props} />
      </div>
      {error && <span className="ui-input-error">{error}</span>}

      <style>{`
        .ui-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }
        .ui-input-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .ui-input-wrap {
          display: flex;
          align-items: center;
          background: var(--bg-input);
          border: 1px solid var(--border);
          transition: all 0.2s ease;
          overflow: hidden;
        }
        .ui-input-wrap:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(180, 35, 42, 0.15);
        }
        .ui-input-wrap.has-error {
          border-color: var(--error);
        }
        .rounded-sm { border-radius: var(--radius-sm); }
        .rounded-md { border-radius: var(--radius-md); }
        .rounded-lg { border-radius: var(--radius-lg); }
        .rounded-full { border-radius: var(--radius-full); }

        .ui-input-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 14px;
          color: var(--text-muted);
        }
        .ui-input-field {
          flex: 1;
          padding: 10px 14px;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--text-primary);
        }
        .ui-input-field::placeholder {
          color: var(--text-muted);
        }
        .ui-input-error {
          font-size: 11px;
          color: var(--error);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  rounded = 'full',
  className = ''
}) => {
  return (
    <div className={`ui-search-bar rounded-${rounded} ${className}`}>
      <Search size={15} className="search-icon" />
      <input
        type="text"
        className="search-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => onChange('')}
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}

      <style>{`
        .ui-search-bar {
          display: flex;
          align-items: center;
          position: relative;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
        }
        .ui-search-bar:focus-within {
          background: var(--bg-card);
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(180, 35, 42, 0.12);
        }
        .search-icon {
          margin-left: 14px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .search-field {
          flex: 1;
          padding: 9px 12px;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text-primary);
        }
        .search-field::placeholder {
          color: var(--text-muted);
        }
        .search-clear-btn {
          margin-right: 10px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: var(--radius-full);
          transition: all 0.15s ease;
        }
        .search-clear-btn:hover {
          color: var(--text-primary);
          background: var(--border);
        }
      `}</style>
    </div>
  );
};

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rounded?: 'sm' | 'md' | 'lg';
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  rounded = 'md',
  className = '',
  ...props
}) => {
  return (
    <div className="ui-textarea-group">
      {label && <label className="ui-input-label">{label}</label>}
      <textarea
        className={`ui-textarea-field rounded-${rounded} ${error ? 'has-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="ui-input-error">{error}</span>}

      <style>{`
        .ui-textarea-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }
        .ui-textarea-field {
          padding: 12px 14px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          outline: none;
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--text-primary);
          transition: all 0.2s ease;
          resize: vertical;
        }
        .ui-textarea-field:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(180, 35, 42, 0.15);
        }
        .ui-textarea-field.has-error {
          border-color: var(--error);
        }
        .ui-textarea-field::placeholder {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
