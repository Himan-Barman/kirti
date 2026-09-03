import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = '580px',
  className = '',
  showCloseButton = true
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div
        className={`ui-modal-content ${className}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button className="ui-modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        )}
        {children}
      </div>

      <style>{`
        .ui-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: var(--modal-backdrop);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: modalFadeIn 0.2s ease-out;
        }
        .ui-modal-content {
          background: var(--bg-modal);
          border-radius: var(--radius-2xl);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-float);
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          color: var(--text-primary);
          animation: modalSlideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ui-modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 34px;
          height: 34px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          color: var(--text-primary);
          border: 1px solid var(--border);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          transition: all 0.18s ease;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .ui-modal-close-btn:hover {
          background: var(--text-primary);
          color: var(--bg-app);
          transform: scale(1.05);
        }
        .ui-modal-close-btn:active {
          transform: scale(0.92);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
