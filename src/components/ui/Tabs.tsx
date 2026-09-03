import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'segmented' | 'underline';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'segmented',
  rounded = 'lg',
  className = ''
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const scrollToCenter = React.useCallback((id: string, smooth: boolean = true) => {
    const btn = tabRefs.current.get(id);
    if (!btn) return;

    try {
      btn.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        inline: 'center',
        block: 'nearest'
      });
    } catch {
      const container = containerRef.current || btn.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const btnLeft = btn.offsetLeft;
        const btnWidth = btn.offsetWidth;
        const targetScroll = btnLeft - (containerWidth / 2) + (btnWidth / 2);
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      scrollToCenter(activeId, false);
    }, 60);
    return () => clearTimeout(timer);
  }, [activeId, scrollToCenter]);

  const handleTabClick = (id: string) => {
    onChange(id);
    scrollToCenter(id, true);
  };

  return (
    <div ref={containerRef} className={`ui-tabs tabs-${variant} tabs-rounded-${rounded} ${className}`}>
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
              else tabRefs.current.delete(tab.id);
            }}
            type="button"
            className={`tab-btn ${isActive ? 'is-active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
            {tab.count !== undefined && <span className="tab-badge">{tab.count}</span>}
          </button>
        );
      })}

      <style>{`
        .ui-tabs {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          user-select: none;
          padding: 4px;
          max-width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
        }
        .ui-tabs::-webkit-scrollbar {
          display: none;
        }

        /* Rounded */
        .tabs-rounded-sm { border-radius: var(--radius-sm); }
        .tabs-rounded-md { border-radius: var(--radius-md); }
        .tabs-rounded-lg { border-radius: var(--radius-lg); }
        .tabs-rounded-full { border-radius: var(--radius-full); }

        /* Variants */
        .tabs-segmented {
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
        }
        .tabs-segmented .tab-btn {
          border-radius: calc(var(--radius-md) - 2px);
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.18s ease;
          font-family: var(--font-sans);
          white-space: nowrap;
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        @media (max-width: 600px) {
          .tabs-segmented .tab-btn {
            padding: 6px 11px;
            font-size: 12px;
            gap: 4px;
          }
        }
        .tabs-segmented .tab-btn:hover {
          color: var(--text-primary);
        }
        .tabs-segmented .tab-btn:active {
          transform: scale(0.95);
        }
        .tabs-segmented .tab-btn.is-active {
          background: var(--bg-card);
          color: var(--text-primary);
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .tabs-pills {
          background: transparent;
          gap: 8px;
          padding: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .tabs-pills::-webkit-scrollbar {
          display: none;
        }
        .tabs-pills .tab-btn {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          border-radius: var(--radius-full);
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.18s ease;
          font-family: var(--font-sans);
          -webkit-tap-highlight-color: transparent !important;
          touch-action: manipulation;
        }
        .tabs-pills .tab-btn:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }
        .tabs-pills .tab-btn:active {
          transform: scale(0.95);
        }
          transform: scale(0.95);
        }
        .tabs-pills .tab-btn.is-active {
          background: var(--text-primary);
          color: var(--bg-app);
          border-color: var(--text-primary);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        }

        .tab-badge {
          font-size: 11px;
          padding: 1px 6px;
          border-radius: var(--radius-full);
          background: var(--bg-card-subtle);
          color: var(--text-muted);
        }
        .tab-btn.is-active .tab-badge {
          background: var(--kirti-red);
          color: #ffffff;
        }
      `}</style>
    </div>
  );
};
