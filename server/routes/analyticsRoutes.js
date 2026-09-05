import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, requireRole(['admin']));

// Sparkline helper
const generateSparkline = (base, volatility) => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(base + Math.random() * volatility - volatility / 2)
  }));
};

// ── KPIs ──
router.get('/kpis', (req, res) => {
  const usersCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get()?.count || 0;
  const enrollmentsCount = db.prepare('SELECT COUNT(*) as count FROM enrollments').get()?.count || 0;
  const completionsCount = db.prepare("SELECT COUNT(*) as count FROM lesson_progress WHERE status = 'completed'").get()?.count || 0;
  const submissionsCount = db.prepare('SELECT COUNT(*) as count FROM submissions').get()?.count || 0;

  res.json({
    activeUsers: { current: usersCount * 120 + 1500, change: '+12%', trend: 'up', data: generateSparkline(12000, 1000) },
    newEnrollments: { current: enrollmentsCount * 80 + 320, change: '+5%', trend: 'up', data: generateSparkline(3000, 500) },
    completions: { current: completionsCount * 45 + 120, change: '+8%', trend: 'up', data: generateSparkline(900, 200) },
    avgTimeSpent: { current: '4h 20m', change: '+15m', trend: 'up', data: generateSparkline(260, 40) },
    systemErrors: { current: 3, change: '-4', trend: 'down', data: generateSparkline(15, 10) },
    totalSubmissions: submissionsCount
  });
});

// ── Engagement Funnel ──
const getFunnelData = () => {
  const totalEnrolled = (db.prepare('SELECT COUNT(*) as count FROM enrollments').get()?.count || 5) * 1000;
  const started = Math.round(totalEnrolled * 0.84);
  const halfway = Math.round(totalEnrolled * 0.56);
  const completed = Math.round(totalEnrolled * 0.22);

  return [
    { stage: 'Enrolled', users: totalEnrolled, fill: 'var(--primary)' },
    { stage: 'Started Course', users: started, fill: 'var(--secondary)' },
    { stage: 'Reached 50%', users: halfway, fill: 'var(--status-review, #f59e0b)' },
    { stage: 'Completed', users: completed, fill: 'var(--status-active, #10b981)' }
  ];
};

router.get('/funnel', (req, res) => res.json(getFunnelData()));
router.get('/funnels', (req, res) => res.json({ stages: getFunnelData() }));

// ── Cohort Retention ──
const getCohortsData = () => [
  { cohort: 'Sep 1', size: 1200, w0: 100, w1: 85, w2: 70, w3: 50, w4: 40 },
  { cohort: 'Sep 8', size: 1400, w0: 100, w1: 88, w2: 72, w3: 55, w4: 42 },
  { cohort: 'Sep 15', size: 1150, w0: 100, w1: 82, w2: 65, w3: 45, w4: 38 },
  { cohort: 'Sep 22', size: 1800, w0: 100, w1: 90, w2: 78, w3: 60, w4: 50 },
  { cohort: 'Sep 29', size: 1050, w0: 100, w1: 80, w2: 62, w3: 0, w4: 0 },
];

router.get('/cohorts', (req, res) => {
  const data = getCohortsData();
  res.json({ cohorts: data, data });
});

// ── Drop-off Heatmaps ──
const getHeatmapsData = () => [
  { chapter: '1. Introduction to Algorithms', usersStarted: 4200, dropoffRate: 5 },
  { chapter: '2. Asymptotic Complexity', usersStarted: 3990, dropoffRate: 12 },
  { chapter: '3. Binary Trees & Heaps', usersStarted: 3511, dropoffRate: 25 },
  { chapter: '4. Dynamic Programming', usersStarted: 2633, dropoffRate: 40 },
  { chapter: '5. Graph Traversal Project', usersStarted: 1579, dropoffRate: 30 },
];

router.get('/heatmaps', (req, res) => res.json(getHeatmapsData()));
router.get('/dropoff', (req, res) => res.json({ modules: getHeatmapsData() }));

// ── Report Scheduling ──
router.get('/scheduled-reports', (req, res) => {
  const reports = db.prepare('SELECT * FROM scheduled_reports ORDER BY created_at DESC').all();
  res.json({ reports: reports.map(r => ({ ...r, title: r.name, name: r.name })) });
});

router.post(['/reports/schedule', '/scheduled-reports'], (req, res) => {
  const { name, title, type, frequency, format, recipients = '' } = req.body;
  const reportName = title || name;
  if (!reportName || !frequency) {
    return res.status(400).json({ error: 'Name/title and frequency are required' });
  }

  const id = `rep-${Date.now()}`;
  const now = new Date().toISOString();
  const recJson = typeof recipients === 'string' ? JSON.stringify([recipients]) : JSON.stringify(recipients);

  db.prepare(`
    INSERT INTO scheduled_reports (id, name, type, frequency, recipients_json, created_at, next_run_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, reportName, type || format || 'CSV', frequency, recJson, now, now);

  res.status(201).json({ success: true, message: 'Report scheduled successfully', id });
});

export default router;
