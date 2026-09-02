import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useStore } from '../../lib/store';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import './Auth.css';

export const SignupView: React.FC = () => {
  const { signUp } = useAuth();
  const { setActiveTab, showToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'warning');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(email, password);

    if (signUpError) {
      let msg = "Couldn't create account. Try again";
      const errLower = signUpError.message.toLowerCase();
      if (errLower.includes('already registered') || errLower.includes('exists')) {
        msg = 'Account already exists. Please sign in';
      } else if (errLower.includes('weak')) {
        msg = 'Password is too weak';
      } else if (errLower.includes('valid email')) {
        msg = 'Enter a valid email address';
      }
      showToast(msg, 'error');
      setLoading(false);
    } else {
      setLoading(false);
      showToast('Welcome', 'success');
      setActiveTab('discover');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">KIRTI</h1>
        <p className="auth-subtitle">Durga Puja. Together.</p>

        <form onSubmit={handleSubmit} className="auth-form">
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
