// Step 5 mock operations

export const verifySsoMetadata = async (xmlString) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Very basic sanity check for mock purposes
      if (xmlString.includes('<EntityDescriptor') || xmlString.includes('entityID=')) {
        resolve({
          entityId: 'https://sts.windows.net/mock-id/',
          loginUrl: 'https://login.microsoftonline.com/mock/saml2',
          certHash: 'a1:b2:c3:d4...'
        });
      } else {
        reject(new Error("Invalid Metadata XML format."));
      }
    }, 800);
  });
};

export const testSsoConnection = async () => {
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1200));
};

export const MOCK_API_KEYS = [
  { id: 'key_1', name: 'Student Information System Sync', prefix: 'pk_live_8f92', created: '2026-03-01', lastUsed: '2026-04-09 10:15 AM' },
  { id: 'key_2', name: 'Zapier Webhooks', prefix: 'pk_live_1d4a', created: '2026-02-15', lastUsed: '2026-04-08 4:00 PM' }
];

export const MOCK_WEBHOOK_LOGS = [
  { id: 1, event: 'user.created', status: 200, time: '10 mins ago', url: 'https://api.hubapi.com/...' },
  { id: 2, event: 'course.completed', status: 500, time: '1 hour ago', url: 'https://api.hubapi.com/...' },
  { id: 3, event: 'assessment.graded', status: 200, time: '2 hours ago', url: 'https://api.customcrm.com/...' },
];

export const MOCK_HEALTH_ALERTS = [
  { id: 101, severity: 'high', message: 'Database connection pool utilization > 90%', time: '5m' },
  { id: 102, severity: 'medium', message: 'Video transcoder queue delay > 10m', time: '15m' },
];

export const executeDeletionRequest = async (userId) => {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1500));
};
