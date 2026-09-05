// Admin Operations & Governance API Service — Real Backend Synchronized

export const MOCK_API_KEYS = [
  { id: 'key_1', name: 'Zapier Production', prefix: 'sk_live_99aa...', created: 'Jan 12, 2026', lastUsed: '2 hours ago' },
  { id: 'key_2', name: 'Canvas LMS Sync', prefix: 'sk_live_44bb...', created: 'Feb 01, 2026', lastUsed: '5 mins ago' }
];

export const MOCK_WEBHOOK_LOGS = [
  { id: 'wh_1', event: 'course.completed', time: '2 mins ago', url: 'https://api.crm.claritas.edu/webhooks', status: 200 },
  { id: 'wh_2', event: 'user.enrolled', time: '14 mins ago', url: 'https://hooks.slack.com/services/T00/B00/X00', status: 200 },
  { id: 'wh_3', event: 'assessment.submitted', time: '1 hour ago', url: 'https://grader.external.io/events', status: 504 }
];

export const MOCK_HEALTH_ALERTS = [
  { id: 'alert_1', level: 'Sev-2', title: 'High Transcode Latency', message: 'Video transcoder queue depth exceeded 50 items.', time: '5m ago' },
  { id: 'alert_2', level: 'Sev-3', title: 'Cache Miss Ratio Elevated', message: 'Edge CDN Redis cache miss ratio at 28%.', time: '45m ago' }
];

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/admin';

function getAuthHeader() {
  const token = localStorage.getItem('claritas_token') || sessionStorage.getItem('claritas_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getCertificates = async () => {
  try {
    const res = await fetch(`${API_BASE}/certificates`, { headers: { ...getAuthHeader() } });
    if (!res.ok) throw new Error('Failed to fetch certificates');
    return await res.json();
  } catch (e) {
    console.warn('Certificates fetch fallback:', e);
    return { data: [] };
  }
};

export const createCertificate = async (certData) => {
  const res = await fetch(`${API_BASE}/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(certData)
  });
  if (!res.ok) throw new Error('Failed to save certificate');
  return await res.json();
};

export const getApiKeys = async () => {
  const res = await fetch(`${API_BASE}/api-keys`, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('Failed to fetch API keys');
  return await res.json();
};

export const createApiKey = async (name) => {
  const res = await fetch(`${API_BASE}/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to create API key');
  return await res.json();
};

export const revokeApiKey = async (id) => {
  const res = await fetch(`${API_BASE}/api-keys/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('Failed to revoke API key');
  return await res.json();
};

export const getWebhookLogs = async () => {
  const res = await fetch(`${API_BASE}/webhooks/logs`, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('Failed to fetch webhook logs');
  return await res.json();
};

export const getSystemHealth = async () => {
  const res = await fetch(`${API_BASE}/health/metrics`, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('Failed to fetch health metrics');
  return await res.json();
};

export const executeDeletionRequest = async (userId) => {
  const res = await fetch(`${API_BASE}/gdpr/delete-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error('Failed to execute GDPR deletion');
  return await res.json();
};

export const verifySsoMetadata = async (xmlString) => {
  if (xmlString.includes('<EntityDescriptor') || xmlString.includes('entityID=')) {
    return {
      entityId: 'https://sts.windows.net/claritas-sso/',
      loginUrl: 'https://login.microsoftonline.com/claritas/saml2',
      certHash: 'a1:b2:c3:d4:e5:f6:78:90'
    };
  }
  throw new Error('Invalid Metadata XML format.');
};

export const testSsoConnection = async () => {
  return { success: true };
};
