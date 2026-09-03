import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Auth.css';

export const ForgotPasswordView: React.FC = () => {
  const { setActiveTab } = useStore();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (resetError) {
      setError('Unable to send reset link. Please check the email address and try again.');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand-logo" onClick={() => setActiveTab('discover')}>
          <span className="logo-text">KIRTI</span>
          <span className="logo-dot"></span>
          <span className="logo-bengali-mark">কীর্তি</span>
        </div>
        
        {success ? (
          <>
            <div className="auth-success">
              <CheckCircle2 size={48} className="success-icon" />
              <p className="auth-subtitle">Check your inbox</p>
              <p className="success-message">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
            </div>
            <button 
              className="auth-submit-btn beam-interactive"
              onClick={() => setActiveTab('login' as any)}
            >
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            <p className="auth-subtitle">Reset Password</p>
            <p className="auth-description">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="auth-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="reset-email">Email</label>
                <div className="input-wrapper beam-interactive">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn beam-interactive" disabled={loading}>
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="auth-footer">
              <button 
                className="auth-link-btn"
                onClick={() => setActiveTab('login' as any)}
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
