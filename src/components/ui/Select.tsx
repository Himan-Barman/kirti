import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  icon,
  rounded = 'full',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`ui-select-container ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`ui-select-trigger rounded-${rounded} ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="trigger-content">
          {icon && <span className="trigger-icon">{icon}</span>}
          <span className="trigger-label">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown size={14} className={`trigger-chevron ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && (
        <div className="ui-select-popup">
          <div className="popup-scroll">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  className={`popup-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="item-text">
                    {option.icon && <span className="item-icon">{option.icon}</span>}
                    <span>{option.label}</span>
                  </div>
                  {isSelected && <Check size={14} className="check-icon" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .ui-select-container {
          position: relative;
          display: inline-block;
          font-family: var(--font-sans);
          user-select: none;
        }
        .ui-select-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
          min-width: 170px;
        }
        .ui-select-trigger:hover {
          border-color: var(--border-focus);
        }
        .ui-select-trigger.is-open {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(180, 35, 42, 0.12);
        }
        .rounded-sm { border-radius: var(--radius-sm); }
        .rounded-md { border-radius: var(--radius-md); }
        .rounded-lg { border-radius: var(--radius-lg); }
        .rounded-full { border-radius: var(--radius-full); }

        .trigger-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .trigger-icon {
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .trigger-label {
          white-space: nowrap;
        }
        .trigger-chevron {
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }
        .trigger-chevron.rotate {
          transform: rotate(180deg);
        }
        .ui-select-popup {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          min-width: 200px;
          background: var(--bg-dropdown);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-float);
          backdrop-filter: blur(12px);
          padding: 6px;
          z-index: 1000;
          animation: popupFade 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .popup-scroll {
          max-height: 260px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .popup-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.14s ease;
        }
        .popup-item:hover {
          background: var(--bg-card-hover);
        }
        .popup-item.is-selected {
          background: var(--bg-card-subtle);
          font-weight: 700;
          color: var(--text-primary);
        }
        .item-text {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .item-icon {
          color: var(--text-muted);
        }
        .check-icon {
          color: var(--kirti-red);
          flex-shrink: 0;
        }
        @keyframes popupFade {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
