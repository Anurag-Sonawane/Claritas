import { Link } from 'react-router-dom';
import { Compass, Home, BookOpen, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'faculty') return '/faculty';
    return '/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #13172e 0%, #080911 100%)',
      color: '#f8fafc',
      padding: 24,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: 580,
        width: '100%',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        padding: '48px 36px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          borderRadius: 30,
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#818cf8',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: 20
        }}>
          <Compass size={16} /> Error 404
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          margin: '0 0 12px 0',
          background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em'
        }}>
          Lost in Hyperspace?
        </h1>

        <p style={{
          color: '#94a3b8',
          fontSize: '1rem',
          lineHeight: 1.6,
          margin: '0 auto 32px',
          maxWidth: 440
        }}>
          The page or resource you are looking for has been moved, renamed, or does not exist in Claritas LMS.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to={getDashboardPath()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
              transition: 'transform 0.2s ease'
            }}
          >
            <Home size={18} /> Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#e2e8f0',
              fontSize: '0.92rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>

        {/* Quick Portal Switcher */}
        <div style={{
          marginTop: 40,
          paddingTop: 24,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          fontSize: '0.82rem',
          color: '#64748b'
        }}>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={14} /> Student
          </Link>
          <span>•</span>
          <Link to="/faculty" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Compass size={14} /> Faculty
          </Link>
          <span>•</span>
          <Link to="/admin" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Shield size={14} /> Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
