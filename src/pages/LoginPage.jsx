import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, BookOpen, Shield, Globe } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      
      // Determine where to send the user
      // If there's a specific 'from' location they tried to access, use it
      const from = location.state?.from?.pathname;
      
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Default routing based on role
        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── Left Side: Brand Showcase ── */}
      <div className="login-left">
        <div className="login-left-bg" />
        <div className="login-left-shapes">
          <div className="login-shape-1" />
          <div className="login-shape-2" />
        </div>

        <div className="login-brand">
          <div className="login-logo">C</div>
          <h1 className="login-brand-name">Claritas LMS</h1>
        </div>

        <div className="login-hero">
          <h2 className="login-hero-title">Empowering modern learning.</h2>
          <p className="login-hero-desc">
            Access your courses, manage your organization, and track progress all in one unified platform.
          </p>
          
          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon"><BookOpen size={16} /></div>
              <span>Immersive, rich-text learning experiences</span>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon"><Globe size={16} /></div>
              <span>SCORM/xAPI compliant course engine</span>
            </div>
            <div className="login-feature">
              <div className="login-feature-icon"><Shield size={16} /></div>
              <span>Enterprise-grade role management</span>
            </div>
          </div>
        </div>

        <div className="login-footer-text">
          © {new Date().getFullYear()} Claritas University. All rights reserved.
        </div>
      </div>

      {/* ── Right Side: Form ── */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <h2 className="login-title">Welcome back</h2>
            <p className="login-subtitle">Please enter your details to sign in.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@claritas.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" disabled={isSubmitting} />
                Remember me
              </label>
              <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Signing in...</>
              ) : (
                <>Sign In</>
              )}
            </button>
            
            <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--glass-border)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--muted)' }}>
              <strong>Test Credentials:</strong><br/>
              Admin: <code>admin@claritas.edu</code><br/>
              Student: <code>student@claritas.edu</code><br/>
              Password: <code>password</code>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
