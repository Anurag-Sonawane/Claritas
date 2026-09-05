// Analytics API Service — Real Backend Synchronized

const API_BASE = 'http://localhost:5000/api/admin/analytics';

function getAuthHeader() {
  const token = localStorage.getItem('claritas_token') || sessionStorage.getItem('claritas_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getKpis = async () => {
  const res = await fetch(`${API_BASE}/kpis`, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('Failed to fetch analytics KPIs');
  return await res.json();
};

export const getFunnel = async () => {
  const res = await fetch(`${API_BASE}/funnel`, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('Failed to fetch funnel data');
  return await res.json();
};

export const getCohorts = async () => {
  const res = await fetch(`${API_BASE}/cohorts`, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('Failed to fetch cohort data');
  return await res.json();
};

export const getHeatmap = async () => {
  const res = await fetch(`${API_BASE}/heatmaps`, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('Failed to fetch heatmap data');
  return await res.json();
};

export const scheduleReport = async (config) => {
  const res = await fetch(`${API_BASE}/reports/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to schedule report');
  return await res.json();
};

export const exportMockData = (type) => {
  const data = `Claritas LMS Export Report\nType: ${type}\nGenerated At: ${new Date().toISOString()}\nStatus: Verified\n`;
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `claritas_${type}_report_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
