import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useStore } from '../../lib/store';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import './Auth.css';

export const LoginView: React.FC = () => {
  const { signIn } = useAuth();
  const { setActiveTab, showToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        showToast('Invalid email or password', 'error');
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
        <h1 className="auth-title">KIRTI</h1>
        <p className="auth-subtitle">Welcome back</p>

        <form onSubmit={handleSubmit} className="auth-form">
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
