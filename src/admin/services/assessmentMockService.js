// Assessment & Grading API Service — Real Backend Synchronized

const API_BASE = 'http://localhost:5000/api/admin';

function getAuthHeader() {
  const token = localStorage.getItem('claritas_token') || sessionStorage.getItem('claritas_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getAssessments = async () => {
  const res = await fetch(`${API_BASE}/assessments`, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('Failed to fetch assessments');
  return await res.json();
};

export const getQuestionBank = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/questions?${query}`, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('Failed to fetch question bank');
  return await res.json();
};

export const getGradingQueue = async () => {
  const res = await fetch(`${API_BASE}/grading-queue`, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('Failed to fetch grading queue');
  return await res.json();
};

export const submitGrade = async (submissionId, score, feedback) => {
  const res = await fetch(`${API_BASE}/grading-queue/${submissionId}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ score, feedback })
  });
  if (!res.ok) throw new Error('Failed to submit grade');
  return await res.json();
};

export const simulatePlagiarismCheck = async (text) => {
  const res = await fetch(`${API_BASE}/plagiarism/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Failed to perform plagiarism check');
  return await res.json();
};
