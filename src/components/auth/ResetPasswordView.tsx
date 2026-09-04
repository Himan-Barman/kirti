import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useStore } from '../../lib/store';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Auth.css';

const validatePassword = (pass: string): string | null => {
  if (pass.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[0-9]/.test(pass)) {
    return 'Password must include at least one number (0-9)';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pass)) {
    return 'Password must include at least one special character';
  }
  return null;
};

export const ResetPasswordView: React.FC = () => {
  const { updateUserPassword } = useAuth();
  const { setActiveTab, showToast } = useStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      showToast('Please enter a new password', 'warning');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      showToast(passwordError, 'warning');
      return;
    }

    if (!confirmPassword) {
      showToast('Please confirm your password', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'warning');
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await updateUserPassword(password);

    if (updateError) {
      let msg = 'Unable to update your password. Please try again.';
      if (updateError.message.toLowerCase().includes('weak')) {
        msg = 'Password must meet security requirements.';
      } else if (updateError.message.toLowerCase().includes('expired')) {
        msg = 'The password reset link has expired. Please request a new one.';
      }
      showToast(msg, 'error');
      setError(msg);
      setLoading(false);
    } else {
      showToast('Password updated successfully', 'success');
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand-logo" onClick={() => setActiveTab('discover')}>
          <span className="logo-text">aabesh</span>
        </div>
        
        {success ? (
          <>
            <div className="auth-success">
              <CheckCircle2 size={48} className="success-icon" />
              <p className="auth-subtitle">Password Updated</p>
              <p className="success-message">
                Your password has been successfully reset.
              </p>
            </div>
            <button 
              className="auth-submit-btn beam-interactive"
              onClick={() => setActiveTab('login' as any)}
            >
              Continue to Login
            </button>
          </>
        ) : (
          <>
            <p className="auth-subtitle">Create New Password</p>

            {error && (
              <div className="auth-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              <div className="input-group">
                <label htmlFor="new-password">New Password</label>
                <div className="input-wrapper beam-interactive">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="input-wrapper beam-interactive">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn beam-interactive" disabled={loading}>
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
