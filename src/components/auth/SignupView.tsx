import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useStore } from '../../lib/store';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import './Auth.css';

const isValidEmail = (emailStr: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
};

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

export const SignupView: React.FC = () => {
  const { signUp } = useAuth();
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
      showToast('Please enter a password', 'warning');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      showToast(passwordError, 'warning');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(trimmedEmail, password);

    if (signUpError) {
      let msg = signUpError.message || "Couldn't create account. Try again";
      const errLower = (signUpError.message || '').toLowerCase();
      if (errLower.includes('already registered') || errLower.includes('exists')) {
        msg = 'Account already exists. Please sign in';
      } else if (errLower.includes('weak')) {
        msg = 'Password is too weak';
      } else if (errLower.includes('rate limit') || errLower.includes('too many requests')) {
        msg = 'Too many attempts. Please try again later.';
      }
      showToast(msg, 'error');
      setLoading(false);
    } else {
      setLoading(false);
      showToast('Welcome to aabesh!', 'success');
      setActiveTab('discover');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand-logo" onClick={() => setActiveTab('discover')}>
          <span className="logo-text">aabesh</span>
        </div>
        <p className="auth-subtitle">Durga Puja. Together.</p>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="input-group">
            <label htmlFor="signup-email">Email</label>
            <div className="input-wrapper beam-interactive">
              <Mail size={18} className="input-icon" />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="signup-password">Password</label>
            <div className="input-wrapper beam-interactive">
              <Lock size={18} className="input-icon" />
              <input
                id="signup-password"
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

          <button type="submit" className="auth-submit-btn beam-interactive" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already a member?{' '}
            <button 
              className="auth-link-btn"
              onClick={() => setActiveTab('login' as any)}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
