// mock service for Analytics step 4

// 90-day mock KPI data for sparklines
const generateSparkline = (base, volatility) => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(base + Math.random() * volatility - volatility / 2)
  }));
};

export const MOCK_KPIS = {
  activeUsers: { current: 12450, change: '+12%', trend: 'up', data: generateSparkline(12000, 1000) },
  newEnrollments: { current: 3420, change: '+5%', trend: 'up', data: generateSparkline(3000, 500) },
  completions: { current: 890, change: '-2%', trend: 'down', data: generateSparkline(900, 200) },
  avgTimeSpent: { current: '4h 20m', change: '+15m', trend: 'up', data: generateSparkline(260, 40) }, // in minutes for chart
  systemErrors: { current: 12, change: '-4', trend: 'down', data: generateSparkline(15, 10) },
};

// Engagment Funnel mock (Enrolled -> Started -> 50% -> Completed)
export const MOCK_FUNNEL = [
  { stage: 'Enrolled', users: 5000, fill: 'var(--primary)' },
  { stage: 'Started Course', users: 4200, fill: 'var(--secondary)' },
  { stage: 'Reached 50%', users: 2800, fill: 'var(--status-review)' },
  { stage: 'Completed', users: 1100, fill: 'var(--status-active)' }
];

// Cohort Retention (Weeks 0-4)
export const MOCK_COHORTS = [
  { cohort: 'Mar 1', size: 1200, w0: 100, w1: 85, w2: 70, w3: 50, w4: 40 },
  { cohort: 'Mar 8', size: 1400, w0: 100, w1: 88, w2: 72, w3: 55, w4: 42 },
  { cohort: 'Mar 15', size: 1150, w0: 100, w1: 82, w2: 65, w3: 45, w4: 38 },
  { cohort: 'Mar 22', size: 1800, w0: 100, w1: 90, w2: 78, w3: 60, w4: 50 },
  { cohort: 'Mar 29', size: 1050, w0: 100, w1: 80, w2: 0, w3: 0, w4: 0 }, // Recent, incomplete weeks
];

// Heatmap data: Lesson drop-offs
// Y: Chapters, X: Drop-off severity (%)
export const MOCK_HEATMAP = [
  { chapter: '1. Introduction', usersStarted: 4200, dropoffRate: 5 },
  { chapter: '2. Basic Concepts', usersStarted: 3990, dropoffRate: 12 },
  { chapter: '3. Core Architecture', usersStarted: 3511, dropoffRate: 25 },
  { chapter: '4. Advanced Deployment', usersStarted: 2633, dropoffRate: 40 },
  { chapter: '5. Final Project', usersStarted: 1579, dropoffRate: 30 },
];

export const getKpis = async () => new Promise(resolve => setTimeout(() => resolve(MOCK_KPIS), 500));
export const getFunnel = async () => new Promise(resolve => setTimeout(() => resolve(MOCK_FUNNEL), 400));
export const getCohorts = async () => new Promise(resolve => setTimeout(() => resolve(MOCK_COHORTS), 600));
export const getHeatmap = async () => new Promise(resolve => setTimeout(() => resolve(MOCK_HEATMAP), 500));

// Mock utility to "schedule" a report
export const scheduleReport = async (config) => {
  return new Promise(resolve => setTimeout(() => {
    console.log('Scheduled report:', config);
    resolve({ success: true, message: 'Report scheduled successfully' });
  }, 1000));
};

export const exportMockData = (type) => {
  // Simulate clicking a download link for CSV/PDF
  return new Promise(resolve => setTimeout(() => {
    resolve({ url: 'blob:mock-url', filename: `export-${Date.now()}.${type}` });
  }, 1500));
};
