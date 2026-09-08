import { useState, useEffect, useRef } from 'react';
import { User, Camera, Upload, Link as LinkIcon, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './ProfileModal.css';

const PRESET_AVATARS = [
  'https://ui-avatars.com/api/?name=Claritas+User&background=6366f1&color=fff',
  'https://ui-avatars.com/api/?name=Alex+Morgan&background=0d9488&color=fff',
  'https://ui-avatars.com/api/?name=Sam+Wilson&background=ec4899&color=fff',
  'https://ui-avatars.com/api/?name=Jordan+Lee&background=f59e0b&color=fff',
  'https://ui-avatars.com/api/?name=Taylor+Swift&background=8b5cf6&color=fff',
];

export default function ProfileModal({ isOpen, onClose, targetUser = null, onSuccess }) {
  const { user: currentUser, updateUser } = useAuth();
  
  // Decide which user we are editing: targetUser or currentUser
  const userToEdit = targetUser || currentUser;
  const isSelf = !targetUser || targetUser.id === currentUser?.id;

  // Verify permission: Only admin and faculty can edit profiles
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'faculty';
  const facultyCanEditTarget = currentUser?.role === 'faculty' ? (isSelf || userToEdit?.role === 'student') : true;
  const hasPermission = canEdit && facultyCanEditTarget;

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || '');
      const initialAvatar = userToEdit.avatarUrl || userToEdit.avatar_url || userToEdit.avatar || '';
      setAvatarUrl(initialAvatar);
      setPreviewUrl(initialAvatar);
      setSelectedFile(null);
      setShowUrlInput(false);
      setCustomUrl('');
      setStatusMessage(null);
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select an image file (PNG, JPG, WebP, GIF)' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image file size must be less than 5MB' });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setShowUrlInput(false);
    setStatusMessage(null);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    setAvatarUrl(customUrl.trim());
    setPreviewUrl(customUrl.trim());
    setSelectedFile(null);
    setShowUrlInput(false);
  };

  const handleSelectPreset = (url) => {
    setAvatarUrl(url);
    setPreviewUrl(url);
    setSelectedFile(null);
    setShowUrlInput(false);
  };

  const handleSave = async () => {
    if (!hasPermission) {
      setStatusMessage({ type: 'error', text: 'You do not have permission to edit this profile.' });
      return;
    }

    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Full Name cannot be empty.' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      let finalAvatarUrl = avatarUrl;

      // 1. If a file was selected, upload it first
      if (selectedFile) {
        if (isSelf) {
          const res = await api.uploadProfilePhoto(selectedFile);
          finalAvatarUrl = res.avatarUrl || res.cdnUrl || finalAvatarUrl;
        } else {
          const res = await api.uploadStudentAvatar(userToEdit.id, selectedFile);
          finalAvatarUrl = res.avatarUrl || res.cdnUrl || finalAvatarUrl;
        }
      }

      // 2. Update user name and avatar in database
      let updatedUserResponse = null;
      if (isSelf) {
        const res = await api.updateProfile({ name: name.trim(), avatarUrl: finalAvatarUrl });
        updatedUserResponse = res.user;
        updateUser({
          name: name.trim(),
          avatarUrl: finalAvatarUrl,
          avatar_url: finalAvatarUrl
        });
      } else {
        const res = await api.updateStudentProfile(userToEdit.id, { name: name.trim(), avatarUrl: finalAvatarUrl });
        updatedUserResponse = res.user;
      }

      setStatusMessage({ type: 'success', text: 'Profile updated and saved to database successfully!' });
      onSuccess?.(updatedUserResponse || { ...userToEdit, name: name.trim(), avatarUrl: finalAvatarUrl, avatar: finalAvatarUrl });

      setTimeout(() => {
        onClose();
      }, 750);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save profile changes.' });
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = userToEdit?.roleName || (userToEdit?.role === 'admin' ? 'Administrator' : userToEdit?.role === 'faculty' ? 'Faculty' : 'Student');

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal-container" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="profile-modal-header">
          <h2>
            <User size={20} style={{ color: 'var(--primary, #6366f1)' }} />
            {isSelf ? 'Edit My Profile' : `Edit Student Profile — ${userToEdit?.name}`}
          </h2>
          <button className="profile-modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="profile-modal-body">
          {/* Permission Notice if user is student */}
          {!hasPermission ? (
            <div className="profile-notice error">
              <AlertCircle size={18} />
              <span>Only Administrators and Faculty members are authorized to update user profiles.</span>
            </div>
          ) : (
            <>
              {/* Avatar Section */}
              <div className="profile-avatar-section">
                <div 
                  className="profile-avatar-wrapper"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to upload new photo"
                >
                  <img
                    src={previewUrl || "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"}
                    alt="Profile Avatar"
                    className="profile-avatar-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff";
                    }}
                  />
                  <div className="profile-avatar-overlay">
                    <Camera size={22} />
                    <span>Upload</span>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  style={{ display: 'none' }}
                />

                <div className="profile-avatar-controls">
                  <button 
                    type="button" 
                    className="profile-upload-btn" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} /> Upload Image
                  </button>
                  <button 
                    type="button" 
                    className="profile-url-btn" 
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    <LinkIcon size={14} /> Custom URL
                  </button>
                </div>

                {/* Custom URL Input Field */}
                {showUrlInput && (
                  <div style={{ display: 'flex', gap: 6, width: '100%', maxWidth: 360, marginTop: 4 }}>
                    <input
                      type="url"
                      placeholder="Paste image URL..."
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="profile-input"
                      style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                    />
                    <button 
                      type="button" 
                      onClick={handleApplyCustomUrl}
                      className="profile-upload-btn"
                      style={{ padding: '6px 12px' }}
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* Preset Avatars */}
                <div className="profile-presets-bar">
                  <span className="profile-presets-label">
                    <Sparkles size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    Presets:
                  </span>
                  {PRESET_AVATARS.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt="Preset"
                      className={`profile-preset-avatar ${previewUrl === preset ? 'active' : ''}`}
                      onClick={() => handleSelectPreset(preset)}
                    />
                  ))}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="profile-form-group">
                <label className="profile-form-label">Full Name</label>
                <div className="profile-input-wrapper">
                  <User size={16} className="profile-input-icon" />
                  <input
                    type="text"
                    className="profile-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    autoFocus
                  />
                </div>
              </div>

              {/* Readonly Account Details */}
              <div className="profile-form-group">
                <label className="profile-form-label">Email Address</label>
                <div className="profile-readonly-field">
                  <span>{userToEdit?.email || '—'}</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>Read-only</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="profile-form-group">
                  <label className="profile-form-label">Role</label>
                  <div className="profile-readonly-field">
                    <span>{roleLabel}</span>
                  </div>
                </div>
                <div className="profile-form-group">
                  <label className="profile-form-label">Account Status</label>
                  <div className="profile-readonly-field" style={{ color: '#34d399' }}>
                    <span>● Active</span>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className={`profile-notice ${statusMessage.type}`}>
                  {statusMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="profile-modal-footer">
          <button type="button" className="profile-btn-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          {hasPermission && (
            <button 
              type="button" 
              className="profile-btn-save" 
              onClick={handleSave} 
              disabled={saving || !name.trim()}
            >
              {saving ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} /> Save Changes
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
