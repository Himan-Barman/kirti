import React, { useState } from 'react';
import { isSupabaseConfigured, saveSupabaseConfig } from '../../lib/supabase';
import { Modal, Input, Button } from '../ui';
import { Database, CheckCircle, RefreshCw, Key, Globe } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(localStorage.getItem('kirti_supabase_url') || '');
  const [anonKey, setAnonKey] = useState(localStorage.getItem('kirti_supabase_anon_key') || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && anonKey.trim()) {
      saveSupabaseConfig(url.trim(), anonKey.trim());
    }
  };

  const handleReset = () => {
    if (confirm('Reset to offline demo dataset with 16 pre-seeded Kolkata pandals?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="520px">
      <div className="config-dialog">
        <div className="config-header">
          <div className="db-icon-wrap">
            <Database size={20} />
          </div>
          <div>
            <h3 className="config-title">Supabase Backend Configuration</h3>
            <p className="config-subtitle">Connect your live Supabase PostgreSQL project or use demo mode</p>
          </div>
        </div>

        <div className="status-banner">
          {isSupabaseConfigured ? (
            <div className="status-live">
              <CheckCircle size={16} />
              <span>Connected to Custom Supabase Backend</span>
            </div>
          ) : (
            <div className="status-demo">
              <span className="demo-dot"></span>
              <span>Running in High-Performance Local Demo Mode</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="config-form">
          <Input
            label="Project URL (SUPABASE_URL)"
            icon={<Globe size={13} />}
            placeholder="https://xyzcompany.supabase.co"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            rounded="md"
          />

          <Input
            label="Anon Public Key (SUPABASE_ANON_KEY)"
            icon={<Key size={13} />}
            type="password"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            rounded="md"
          />

          <p className="helper-note">
            The full database schema with RLS security policies is available in <code>supabase_schema.sql</code>.
          </p>

          <div className="config-actions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              rounded="full"
              icon={<RefreshCw size={13} />}
              onClick={handleReset}
            >
              Reset Demo Data
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              rounded="full"
            >
              Save & Connect
            </Button>
          </div>
        </form>
      </div>

      <style>{`
        .config-dialog {
          padding: 24px;
        }
        .config-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .db-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }
        .config-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .config-subtitle {
          font-size: 12px;
          color: var(--text-muted);
        }
        .status-banner {
          margin-bottom: 18px;
          padding: 12px 16px;
          border-radius: var(--radius-lg);
          font-size: 13px;
          font-weight: 600;
        }
        .status-live {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #E6F4EA;
          color: var(--success);
        }
        .status-demo {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card-subtle);
          border: 1px solid var(--border);
          color: var(--text-primary);
        }
        .demo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--kirti-red);
        }
        .config-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .helper-note {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .helper-note code {
          background: var(--bg-card-subtle);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          font-family: monospace;
          color: var(--text-primary);
        }
        .config-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }
      `}</style>
    </Modal>
  );
};
