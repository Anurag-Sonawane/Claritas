import { useState } from 'react';
import { Send, Plus, X } from 'lucide-react';
import Modal from './Modal.jsx';
import { roles, inviteTemplates } from '../data/adminMockData.js';
import { sendInvites, getOrganizations } from '../services/adminApi.js';

export default function InviteModal({ isOpen, onClose, onSuccess }) {
  const [emails, setEmails] = useState('');
  const [roleId, setRoleId] = useState('role-course-mgr');
  const [org, setOrg] = useState('Claritas University');
  const [templateId, setTemplateId] = useState('tpl-default');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const orgs = getOrganizations();
  const template = inviteTemplates.find(t => t.id === templateId);
  const emailList = emails.split(/[,;\n]+/).map(e => e.trim()).filter(e => e.includes('@'));
  const subject = customSubject || template?.subject || '';
  const body = customBody || template?.body || '';

  const handleSend = async () => {
    if (emailList.length === 0) return;
    setSending(true);
    try {
      await sendInvites({ emails: emailList, roleId, orgId: org, templateId, customSubject: subject, customBody: body });
      setSent(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setEmails('');
    setRoleId('role-course-mgr');
    setOrg('Claritas University');
    setTemplateId('tpl-default');
    setCustomSubject('');
    setCustomBody('');
    setSent(false);
    setSending(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Users"
      size="lg"
      footer={
        sent ? null : (
          <>
            <button className="btn-secondary" onClick={handleClose} style={{
              background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--muted)', padding: '10px 20px', borderRadius: 8, cursor: 'pointer'
            }}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSend} disabled={emailList.length === 0 || sending} style={{ opacity: (emailList.length === 0 || sending) ? 0.4 : 1 }}>
              <Send size={16} /> {sending ? 'Sending...' : `Send ${emailList.length} Invite${emailList.length !== 1 ? 's' : ''}`}
            </button>
          </>
        )
      }
    >
      {sent ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--status-active-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Send size={28} style={{ color: 'var(--status-active)' }} />
          </div>
          <h3 style={{ margin: '0 0 8px' }}>Invitations Sent!</h3>
          <p style={{ color: 'var(--muted)' }}>{emailList.length} invitation(s) have been sent successfully.</p>
        </div>
      ) : (
        <div>
          {/* Emails */}
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email Addresses <span style={{ color: 'var(--primary)' }}>*</span>
            </label>
            <textarea
              value={emails}
              onChange={e => setEmails(e.target.value)}
              placeholder="Enter email addresses separated by commas or new lines..."
              rows={3}
              className="form-input"
              style={{ resize: 'vertical' }}
            />
            {emailList.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {emailList.map((email, i) => (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', background: 'rgba(46,196,241,0.1)',
                    border: '1px solid rgba(46,196,241,0.2)', borderRadius: 20,
                    fontSize: '0.78rem', color: 'var(--secondary)',
                  }}>
                    {email}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Role & Org */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</label>
              <select className="form-input" value={roleId} onChange={e => setRoleId(e.target.value)}>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organization</label>
              <select className="form-input" value={org} onChange={e => setOrg(e.target.value)}>
                {orgs.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Template */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Template</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {inviteTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTemplateId(t.id); setCustomSubject(''); setCustomBody(''); }}
                  style={{
                    padding: '8px 16px', borderRadius: 8,
                    background: templateId === t.id ? 'rgba(46,196,241,0.1)' : 'var(--admin-input-bg)',
                    border: `1px solid ${templateId === t.id ? 'rgba(46,196,241,0.3)' : 'var(--admin-input-border)'}`,
                    color: templateId === t.id ? 'var(--secondary)' : 'var(--muted)',
                    fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject Line</label>
            <input className="form-input" value={subject} onChange={e => setCustomSubject(e.target.value)} />
          </div>

          {/* Body Preview */}
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email Body
              <span style={{ fontSize: '0.72rem', marginLeft: 8, opacity: 0.7 }}>Merge tags: {'{{name}}'}, {'{{role}}'}, {'{{link}}'}</span>
            </label>
            <textarea
              className="form-input"
              value={body}
              onChange={e => setCustomBody(e.target.value)}
              rows={8}
              style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
