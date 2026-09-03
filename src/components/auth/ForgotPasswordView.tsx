import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Auth.css';

const isValidEmail = (emailStr: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
};

export const ForgotPasswordView: React.FC = () => {
  const { setActiveTab, showToast } = useStore();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showToast('Please enter your email', 'warning');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase!.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: window.location.origin,
    });

    if (resetError) {
      showToast('Unable to send reset link. Please check email address.', 'error');
      setError('Unable to send reset link. Please check the email address and try again.');
      setLoading(false);
    } else {
      showToast('Reset link sent to your email', 'success');
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

            <form onSubmit={handleSubmit} noValidate className="auth-form">
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
