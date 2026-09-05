import { useState, useEffect } from 'react';
import { Award, Download, Save, Type, Palette, Check } from 'lucide-react';
import { getCertificates, createCertificate } from '../services/operationsMockService.js';
import './CertificatesPage.css';

const TEMPLATE_VARS = ['{{student_name}}', '{{course_name}}', '{{issue_date}}', '{{score}}'];

export default function CertificatesPage() {
  const [template, setTemplate] = useState({
    title: 'Certificate of Completion',
    subtitle: 'This is to certify that',
    body: '{{student_name}}\n\nhas successfully completed the course\n\n{{course_name}}',
    dateText: 'Issued on {{issue_date}}',
    gradientInfo: 'linear-gradient(135deg, #1e3a8a, #9333ea)',
    textColor: '#ffffff',
  });

  const [activeTab, setActiveTab] = useState('content');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    async function loadCerts() {
      try {
        const res = await getCertificates();
        if (res?.data && res.data.length > 0) {
          const first = res.data[0];
          try {
            const parsedRules = typeof first.rules === 'string' ? JSON.parse(first.rules) : first.rules;
            if (parsedRules) {
              setTemplate(prev => ({
                ...prev,
                title: first.name || prev.title,
                ...parsedRules
              }));
            }
          } catch {
            // keep default
          }
        }
      } catch (err) {
        console.warn('Certificate load error:', err);
      }
    }
    loadCerts();
  }, []);

  const insertVar = (v) => {
    setTemplate(prev => ({ ...prev, body: prev.body + ' ' + v }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await createCertificate({
        name: template.title,
        course: 'General / All Courses',
        rules: JSON.stringify({
          subtitle: template.subtitle,
          body: template.body,
          dateText: template.dateText,
          gradientInfo: template.gradientInfo,
          textColor: template.textColor
        })
      });
      setSavedMsg('Template saved to backend!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (e) {
      alert('Failed to save certificate: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="certificates-page">
      <div className="courses-header">
        <h1><Award size={24} style={{ color: 'var(--primary)' }} /> Certificate Templates</h1>
        <div className="courses-toolbar">
          {savedMsg && (
            <span style={{ color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
              <Check size={16} /> {savedMsg}
            </span>
          )}
          <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="cert-builder">
        {/* Left Side: Controls */}
        <div className="cert-controls">
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
              <Type size={16} /> Content
            </button>
            <button className={`tab-btn ${activeTab === 'design' ? 'active' : ''}`} onClick={() => setActiveTab('design')}>
              <Palette size={16} /> Design
            </button>
          </div>

          <div className="controls-body">
            {activeTab === 'content' && (
              <div className="control-group">
                <label>Certificate Title</label>
                <input type="text" value={template.title} onChange={e => setTemplate({...template, title: e.target.value})} />

                <label>Subtitle</label>
                <input type="text" value={template.subtitle} onChange={e => setTemplate({...template, subtitle: e.target.value})} />

                <label>Body Content</label>
                <textarea 
                  rows="6" 
                  value={template.body} 
                  onChange={e => setTemplate({...template, body: e.target.value})} 
                />

                <label>Date Details</label>
                <input type="text" value={template.dateText} onChange={e => setTemplate({...template, dateText: e.target.value})} />

                <div className="vars-helper">
                  <label>Available Variables (Click to insert text)</label>
                  <div className="var-badges">
                    {TEMPLATE_VARS.map(v => (
                      <span key={v} className="var-badge" onClick={() => insertVar(v)}>{v}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="control-group">
                <label>Background Gradient</label>
                <select value={template.gradientInfo} onChange={e => setTemplate({...template, gradientInfo: e.target.value})}>
                  <option value="linear-gradient(135deg, #1e3a8a, #9333ea)">Default Purple/Blue</option>
                  <option value="linear-gradient(135deg, #111827, #374151)">Dark Slate</option>
                  <option value="linear-gradient(135deg, #0f766e, #0369a1)">Ocean</option>
                  <option value="linear-gradient(135deg, #b91c1c, #c2410c)">Sunset</option>
                </select>

                <label>Text Color (Hex)</label>
                <input type="color" value={template.textColor} onChange={e => setTemplate({...template, textColor: e.target.value})} style={{ height: 40, width: '100%', padding: 0 }} />
                
                <h4 style={{ marginTop: 24, marginBottom: 12 }}>Issuance Rules</h4>
                <label>Minimum Score to Issue (%)</label>
                <input type="number" defaultValue="80" />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Preview */}
        <div className="cert-preview-pane">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem' }}>Live Preview</h3>
            <button className="btn-outline btn-sm"><Download size={14} /> Mock PDF</button>
          </div>
          
          <div className="cert-preview-container">
            <div 
              className="cert-preview-card"
              style={{
                background: template.gradientInfo,
                color: template.textColor
              }}
            >
              <div className="cert-inner-border">
                <div className="cert-header">
                  <Award size={48} opacity={0.8} />
                  <h2>{template.title}</h2>
                  <h4>{template.subtitle}</h4>
                </div>
                
                <div className="cert-body">
                  {/* Simulate markdown/variables replacement */}
                  {template.body.split('\n').map((line, i) => (
                    <p key={i}>
                      {line
                        .replace('{{student_name}}', 'Student Name Placeholder')
                        .replace('{{course_name}}', 'Course Title Placeholder')}
                    </p>
                  ))}
                </div>

                <div className="cert-footer">
                  <div className="cert-date">
                    {template.dateText.replace('{{issue_date}}', new Date().toLocaleDateString())}
                  </div>
                  <div className="cert-signature">
                    <div className="sig-line" style={{ borderBottomColor: template.textColor }} />
                    <span>Authorized Signature</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
