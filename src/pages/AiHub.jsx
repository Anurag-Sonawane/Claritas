import { Sparkles, FileText, Presentation, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AiHub() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const basePath = isAdmin ? '/admin/ai' : '/ai';

  const tools = [
    { 
      path: `${basePath}/summary`, 
      name: 'Lecture Summary', 
      desc: 'Condense hour-long video lectures into a 5-minute actionable brief.',
      icon: FileText,
      color: '#f43f5e'
    },
    { 
      path: `${basePath}/flashcards`, 
      name: 'Flashcard Generator', 
      desc: 'Turn course PDFs into interactive spaced-repetition decks instantly.',
      icon: LayoutDashboard,
      color: '#3b82f6'
    },
    { 
      path: `${basePath}/ppt`, 
      name: 'PPT Pitch Deck Maker', 
      desc: 'Generate entire slide deck outlines and content from a basic prompt.',
      icon: Presentation,
      color: '#a855f7'
    }
  ];

  return (
    <div>
      <div className="surface glow-panel" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '3rem', 
        borderRadius: '16px',
        marginBottom: '2rem',
        border: '1px solid rgba(46, 196, 241, 0.3)',
        background: 'linear-gradient(135deg, rgba(46, 196, 241, 0.05), transparent)'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sparkles size={36} color="var(--secondary)" /> AI Study Hub
          </h1>
          <p className="text-muted" style={{ fontSize: '1.2rem', margin: 0, maxWidth: 600 }}>
            Supercharge your workflow. Instantly structure unstructured material into pristine summaries, decks, and flashcards.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <Link key={tool.name} to={tool.path} style={{ textDecoration: 'none' }}>
              <div className="surface" style={{ 
                padding: '2rem', 
                borderRadius: '16px', 
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.2s',
                border: '1px solid var(--glass-border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = tool.color;
                e.currentTarget.style.boxShadow = `0 12px 30px ${tool.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: `${tool.color}15`, color: tool.color, width: 'fit-content', marginBottom: '1.5rem' }}>
                  <Icon size={32} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)', fontSize: '1.4rem' }}>{tool.name}</h3>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {tool.desc}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
