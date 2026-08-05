import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Mail, Lock, Eye, EyeOff, BookOpen, Shield, Globe, User, Building, CheckCircle2 } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [regDept, setRegDept] = useState('Computer Science');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to appropriate view
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'faculty') {
        navigate('/faculty', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate, location]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(email, password, rememberMe);
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (loggedInUser.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (loggedInUser.role === 'faculty') {
          navigate('/faculty', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        role: regRole,
        department: regDept,
        password: regPassword,
      });

      setSuccessMsg(res.message || 'Registration request submitted! Your account is pending Admin approval.');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setMode('login');
    } catch (err) {
      setError(err.message || 'Registration request failed');
    } finally {
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
              <span>Enterprise-grade role & registration approval</span>
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
          
          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, padding: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', border: 'none', fontWeight: 600, fontSize: '0.9rem',
                background: mode === 'login' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                color: mode === 'login' ? '#fff' : 'var(--muted)', transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', border: 'none', fontWeight: 600, fontSize: '0.9rem',
                background: mode === 'register' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                color: mode === 'register' ? '#fff' : 'var(--muted)', transition: 'all 0.2s ease'
              }}
            >
              Request Account
            </button>
          </div>

          <div className="login-header">
            <h2 className="login-title">{mode === 'login' ? 'Welcome back' : 'Request New Account'}</h2>
            <p className="login-subtitle">
              {mode === 'login' 
                ? 'Please enter your details to sign in.' 
                : 'Submit your details for Admin registration approval.'}
            </p>
          </div>

          {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
          {successMsg && (
            <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, color: '#10b981', fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} /> {successMsg}
            </div>
          )}

          {mode === 'login' ? (
            /* ── Login Form ── */
            <form className="login-form" onSubmit={handleLoginSubmit}>
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
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting} 
                  />
                  Remember me
                </label>
                <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="login-btn" disabled={isSubmitting}>
                {isSubmitting ? <>Signing in...</> : <>Sign In</>}
              </button>
              
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--glass-border)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--muted)' }}>
                <strong>Test Credentials:</strong><br/>
                Admin: <code>admin@claritas.edu</code><br/>
                Faculty: <code>teacher@claritas.edu</code><br/>
                Student: <code>student@claritas.edu</code><br/>
                Password: <code>password</code>
              </div>
            </form>
          ) : (
            /* ── Registration Form ── */
            <form className="login-form" onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label htmlFor="regName">Full Name *</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    id="regName"
                    type="text"
                    required
                    placeholder="e.g. Om Pawar"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="regEmail">Email Address *</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="regEmail"
                    type="email"
                    required
                    placeholder="e.g. ompawar@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label htmlFor="regRole">Requested Role</label>
                  <select
                    id="regRole"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none'
                    }}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty / Instructor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="regDept">Department</label>
                  <input
                    id="regDept"
                    type="text"
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="regPassword">Requested Password *</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="regPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={isSubmitting}>
                {isSubmitting ? <>Submitting Request...</> : <>Submit Registration Request</>}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

