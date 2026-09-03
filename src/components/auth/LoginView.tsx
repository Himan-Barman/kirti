import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useStore } from '../../lib/store';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import './Auth.css';

const isValidEmail = (emailStr: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
};

export const LoginView: React.FC = () => {
  const { signIn } = useAuth();
  const { setActiveTab, showToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

    if (!password) {
      showToast('Please enter your password', 'warning');
      return;
    }

    setLoading(true);

    const { error: signInError } = await signIn(trimmedEmail, password);

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        showToast('Invalid email or password', 'error');
      } else if (signInError.message.includes('Email not confirmed')) {
        showToast('Please check your email to verify your account', 'warning');
      } else {
        showToast('Unable to sign in. Please try again', 'error');
      }
      setLoading(false);
    } else {
      // Success
      setLoading(false);
      showToast('Welcome back', 'success');
      setActiveTab('discover');
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
        <p className="auth-subtitle">Welcome back</p>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper beam-interactive">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper beam-interactive">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
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

          <div className="auth-actions">
            <button 
              type="button" 
              className="forgot-password-link"
              onClick={() => setActiveTab('forgot-password' as any)}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-submit-btn beam-interactive" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New to Kirti?{' '}
            <button 
              className="auth-link-btn"
              onClick={() => setActiveTab('signup' as any)}
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
