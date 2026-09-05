import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { initDatabase } from '../server/db.js';

describe('Core LMS Workflows & Database Sync Suite', () => {
  let adminToken = '';
  let studentToken = '';

  beforeAll(async () => {
    initDatabase();

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@claritas.edu', password: 'password' });
    adminToken = adminLogin.body.token;

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@claritas.edu', password: 'password' });
    studentToken = studentLogin.body.token;
  });

  it('1. Course Version Snapshotting and Rollback', async () => {
    const createRes = await request(app)
      .post('/api/admin/courses/crs-001/versions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label: 'v2 Release', changes: ['Added binary tree modules'] });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.version).toBeGreaterThanOrEqual(1);
    const verId = createRes.body.data.id;

    const rollbackRes = await request(app)
      .post('/api/admin/courses/crs-001/rollback')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ versionId: verId });

    expect(rollbackRes.status).toBe(200);
    expect(rollbackRes.body.success).toBe(true);
  });

  it('2. Media Library Upload & Filtering', async () => {
    const uploadRes = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'test_cheatsheet.pdf',
        folder: 'Documents',
        type: 'pdf',
        size: 15000
      });

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.data.name).toBe('test_cheatsheet.pdf');

    const listRes = await request(app)
      .get('/api/admin/media?folder=Documents')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some(m => m.name === 'test_cheatsheet.pdf')).toBe(true);
  });

  it('3. SCORM Package Validation Lifecycle', async () => {
    const uploadRes = await request(app)
      .post('/api/admin/scorm/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ courseId: 'crs-001', fileName: 'dsa_lab.zip' });

    expect(uploadRes.status).toBe(201);
    const jobId = uploadRes.body.data.jobId;

    const statusRes = await request(app)
      .get(`/api/admin/scorm/${jobId}/status`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.status).toBe('valid');
  });

  it('4. Question Bank Item Creation & Querying', async () => {
    const createQ = await request(app)
      .post('/api/admin/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        text: 'What is the time complexity of QuickSort average case?',
        type: 'MCQ',
        difficulty: 'Medium',
        tags: ['Sorting', 'Algorithms'],
        options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)'],
        answer: 'O(n log n)',
        points: 10
      });

    expect(createQ.status).toBe(201);
    expect(createQ.body.id).toBeDefined();

    const queryQ = await request(app)
      .get('/api/admin/questions?type=MCQ')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(queryQ.status).toBe(200);
    expect(queryQ.body.length).toBeGreaterThan(0);
  });

  it('5. Assessment Submission & Manual Grading', async () => {
    const queueRes = await request(app)
      .get('/api/admin/grading-queue')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(queueRes.status).toBe(200);
    expect(Array.isArray(queueRes.body)).toBe(true);

    if (queueRes.body.length > 0) {
      const subId = queueRes.body[0].id;
      const gradeRes = await request(app)
        .post(`/api/admin/grading-queue/${subId}/grade`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ score: 92, feedback: 'Great job!' });

      expect(gradeRes.status).toBe(200);
      expect(gradeRes.body.success).toBe(true);
    }
  });

  it('6. Real Analytics KPIs & Funnel Computations', async () => {
    const kpiRes = await request(app)
      .get('/api/admin/analytics/kpis')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(kpiRes.status).toBe(200);
    expect(kpiRes.body.activeUsers).toBeDefined();
    expect(kpiRes.body.newEnrollments).toBeDefined();

    const funnelRes = await request(app)
      .get('/api/admin/analytics/funnel')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(funnelRes.status).toBe(200);
    expect(funnelRes.body.length).toBe(4);
    expect(funnelRes.body[0].stage).toBe('Enrolled');
  });

  it('7. API Key Generation, Prefix Masking & Revocation', async () => {
    const createKey = await request(app)
      .post('/api/admin/api-keys')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'LTI Integration Key' });

    expect(createKey.status).toBe(201);
    expect(createKey.body.rawSecret).toMatch(/^[sp]k_live_/);
    expect(createKey.body.prefix).toBeDefined();
    const keyId = createKey.body.id;

    const revokeKey = await request(app)
      .delete(`/api/admin/api-keys/${keyId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(revokeKey.status).toBe(200);
  });

  it('8. Student Lesson Progress Completion', async () => {
    const compRes = await request(app)
      .post('/api/student/courses/crs-001/lessons/les-2/complete')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(compRes.status).toBe(200);
    expect(compRes.body.success).toBe(true);

    const progRes = await request(app)
      .get('/api/student/courses/crs-001/progress')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(progRes.status).toBe(200);
    expect(progRes.body.completedLessons).toContain('les-2');
  });
});
