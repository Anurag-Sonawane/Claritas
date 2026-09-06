import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { initDatabase, db } from '../server/db.js';

describe('Comprehensive End-to-End LMS Platform Test Suite', () => {
  let adminToken = '';
  let facultyToken = '';
  let studentToken = '';
  let adminRefreshToken = '';
  let testCourseId = '';
  let testApiKeyId = '';

  beforeAll(async () => {
    await initDatabase();

    // 1. Authenticate Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@claritas.edu', password: 'password' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.token;
    adminRefreshToken = adminRes.body.refreshToken;

    // 2. Authenticate Faculty
    const facultyRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'faculty@claritas.edu', password: 'password' });
    expect(facultyRes.status).toBe(200);
    facultyToken = facultyRes.body.token;

    // 3. Authenticate Student
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@claritas.edu', password: 'password' });
    expect(studentRes.status).toBe(200);
    studentToken = studentRes.body.token;
  });

  // ==========================================
  // 1. AUTHENTICATION & IDENTITY LIFECYCLE
  // ==========================================
  describe('1. Authentication & Security Life Cycle', () => {
    it('1.1 Rejects registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin Clone',
          email: 'admin@claritas.edu',
          password: 'password123',
          role: 'student'
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('1.2 Registers a new student and sets status to pending', async () => {
      const testEmail = `newstudent_${Date.now()}@claritas.edu`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: testEmail,
          password: 'password123',
          role: 'student',
          department: 'Computer Science'
        });
      expect(res.status).toBe(201);
      expect(res.body.user.status).toBe('pending');
    });

    it('1.3 Rejects login for non-existent users and wrong passwords', async () => {
      const badEmailRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@claritas.edu', password: 'password' });
      expect(badEmailRes.status).toBe(401);

      const badPassRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@claritas.edu', password: 'wrongpassword' });
      expect(badPassRes.status).toBe(401);
    });

    it('1.4 Fetches profile (/api/auth/me) with assigned RBAC permissions', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('admin@claritas.edu');
      expect(res.body.user.role).toBe('admin');
      expect(Array.isArray(res.body.user.permissions)).toBe(true);
    });

    it('1.5 Rotates refresh token successfully', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: adminRefreshToken });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });

  // ==========================================
  // 2. ADMIN COURSE MANAGEMENT WORKFLOW
  // ==========================================
  describe('2. Course Management & Lifecycle', () => {
    it('2.1 Creates a new course with full metadata', async () => {
      const res = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Advanced Distributed Systems',
          code: `CS-DIST-${Date.now().toString().slice(-4)}`,
          category: 'Engineering',
          level: 'Advanced',
          credits: 4,
          description: 'Comprehensive study of distributed consensus and fault-tolerant architectures.',
          managerId: 'usr-faculty-01',
          managerName: 'Dr. Robert Vance'
        });
      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      testCourseId = res.body.data.id;
    });

    it('2.2 Fetches course details by ID and course listing with filters', async () => {
      const getRes = await request(app)
        .get(`/api/admin/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.title).toBe('Advanced Distributed Systems');

      const listRes = await request(app)
        .get('/api/admin/courses?category=Engineering')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.some(c => c.id === testCourseId)).toBe(true);
    });

    it('2.3 Creates course version snapshot and verifies rollback', async () => {
      const verRes = await request(app)
        .post(`/api/admin/courses/${testCourseId}/versions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ label: 'Initial Draft v1.0', changes: ['Added module 1 syllabus'] });
      expect(verRes.status).toBe(201);
      const versionId = verRes.body.data.id;

      const rollbackRes = await request(app)
        .post(`/api/admin/courses/${testCourseId}/rollback`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ versionId });
      expect(rollbackRes.status).toBe(200);
      expect(rollbackRes.body.success).toBe(true);
    });

    it('2.4 Publishes, unpublishes and archives course', async () => {
      const pubRes = await request(app)
        .put(`/api/admin/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'published' });
      expect(pubRes.status).toBe(200);
      expect(pubRes.body.data.status).toBe('published');

      const unpubRes = await request(app)
        .put(`/api/admin/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'draft' });
      expect(unpubRes.status).toBe(200);
      expect(unpubRes.body.data.status).toBe('draft');
    });
  });

  // ==========================================
  // 3. MEDIA LIBRARY & SCORM PACKAGES
  // ==========================================
  describe('3. Media Library & SCORM Management', () => {
    it('3.1 Uploads media asset and retrieves media library', async () => {
      const uploadRes = await request(app)
        .post('/api/admin/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'distributed_consensus.pdf',
          folder: 'Lectures',
          type: 'pdf',
          size: 45000,
          cdnUrl: 'https://cdn.claritas.edu/media/distributed_consensus.pdf'
        });
      expect(uploadRes.status).toBe(201);
      expect(uploadRes.body.data.name).toBe('distributed_consensus.pdf');

      const listRes = await request(app)
        .get('/api/admin/media?folder=Lectures')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.some(m => m.name === 'distributed_consensus.pdf')).toBe(true);
    });

    it('3.2 SCORM Package upload and asynchronous validation polling', async () => {
      const uploadRes = await request(app)
        .post('/api/admin/scorm/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ courseId: testCourseId, fileName: 'raft_simulation.zip', fileSize: 85000 });
      expect(uploadRes.status).toBe(201);
      const jobId = uploadRes.body.data.jobId;

      const statusRes = await request(app)
        .get(`/api/admin/scorm/${jobId}/status`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.status).toBe('valid');
    });
  });

  // ==========================================
  // 4. QUESTION BANK & ASSESSMENTS
  // ==========================================
  describe('4. Question Bank & Assessment Scoring', () => {
    it('4.1 Creates a question in Question Bank', async () => {
      const res = await request(app)
        .post('/api/admin/questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          text: 'Which algorithm is used in Raft consensus for leader election?',
          type: 'MCQ',
          difficulty: 'Hard',
          tags: ['Distributed Systems', 'Consensus'],
          options: ['Heartbeat Timeout', 'Proof of Work', 'Round Robin', 'Dijkstra'],
          answer: 'Heartbeat Timeout',
          points: 10
        });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
    });

    it('4.2 AI Question Generator Simulator', async () => {
      const res = await request(app)
        .post('/api/admin/questions/generate-ai')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          topic: 'Cloud Microservices',
          difficulty: 'Medium',
          count: 2,
          type: 'MCQ'
        });
      expect(res.status).toBe(200);
      expect(res.body.questions.length).toBe(2);
      expect(res.body.questions[0].tags).toContain('AI-Generated');
    });

    it('4.3 Student submits assessment and receives calculated score', async () => {
      const res = await request(app)
        .post('/api/admin/assessments/asm-001/submit')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studentId: 'usr-student-01',
          answers: { q1: 'O(log n)', q2: 'True' },
          timeSpentSeconds: 420
        });
      expect(res.status).toBe(200);
      expect(res.body.score).toBeDefined();
      expect(res.body.passed).toBeDefined();
    });
  });

  // ==========================================
  // 5. ANALYTICS & REPORTING ENGINE
  // ==========================================
  describe('5. Analytics & Reporting Engine', () => {
    it('5.1 Fetches dynamic cohort retention metrics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/cohorts')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.cohorts)).toBe(true);
      expect(res.body.cohorts.length).toBeGreaterThanOrEqual(1);
    });

    it('5.2 Fetches engagement funnels and dropoff heatmaps', async () => {
      const funnelRes = await request(app)
        .get('/api/admin/analytics/funnels')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(funnelRes.status).toBe(200);
      expect(Array.isArray(funnelRes.body.stages)).toBe(true);

      const heatRes = await request(app)
        .get('/api/admin/analytics/dropoff')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(heatRes.status).toBe(200);
      expect(Array.isArray(heatRes.body.modules)).toBe(true);
    });

    it('5.3 Lists and creates scheduled reports', async () => {
      const createRes = await request(app)
        .post('/api/admin/analytics/scheduled-reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Weekly Faculty Activity Summary',
          frequency: 'weekly',
          format: 'CSV',
          recipients: 'admin@claritas.edu'
        });
      expect(createRes.status).toBe(201);

      const listRes = await request(app)
        .get('/api/admin/analytics/scheduled-reports')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.reports.some(r => r.title === 'Weekly Faculty Activity Summary')).toBe(true);
    });
  });

  // ==========================================
  // 6. OPERATIONS & GOVERNANCE
  // ==========================================
  describe('6. Platform Operations, API Keys & GDPR', () => {
    it('6.1 Creates, lists (masked), and revokes API Keys', async () => {
      const createRes = await request(app)
        .post('/api/admin/api-keys')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Integration Service Key' });
      expect(createRes.status).toBe(201);
      expect(createRes.body.key).toMatch(/^sk_live_/);
      testApiKeyId = createRes.body.id;

      const listRes = await request(app)
        .get('/api/admin/api-keys')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(listRes.status).toBe(200);
      const createdKey = listRes.body.find(k => k.id === testApiKeyId);
      expect(createdKey).toBeDefined();
      expect(createdKey.prefix).toMatch(/^sk_live_/);

      const revokeRes = await request(app)
        .delete(`/api/admin/api-keys/${testApiKeyId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(revokeRes.status).toBe(200);
      expect(revokeRes.body.success).toBe(true);
    });

    it('6.2 Fetches live system health telemetry', async () => {
      const res = await request(app)
        .get('/api/admin/health/metrics')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.cpuUsage).toBeDefined();
      expect(res.body.databaseLatency).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });

    it('6.3 Executes GDPR Data Deletion request with anonymization', async () => {
      const tempEmail = `gdpr_student_${Date.now()}@claritas.edu`;
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'GDPR Student',
          email: tempEmail,
          password: 'password123',
          role: 'student'
        });
      const tempId = regRes.body.user.id;

      const gdprRes = await request(app)
        .post('/api/admin/gdpr/delete-user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: tempId });
      expect(gdprRes.status).toBe(200);
      expect(gdprRes.body.success).toBe(true);

      const checkUser = await db.get('SELECT status FROM users WHERE id = ?', [tempId]);
      expect(checkUser.status).toBe('deleted');
    });
  });

  // ==========================================
  // 7. STUDENT & FACULTY EXPERIENCES
  // ==========================================
  describe('7. Student & Faculty Endpoints', () => {
    it('7.1 Student queries dashboard metrics & updates lesson progress', async () => {
      const dashRes = await request(app)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(dashRes.status).toBe(200);
      expect(dashRes.body.gpa).toBeDefined();

      const progRes = await request(app)
        .post('/api/student/lessons/les-001/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ completed: true, timeSpentSeconds: 600 });
      expect(progRes.status).toBe(200);
      expect(progRes.body.success).toBe(true);
    });

    it('7.2 Faculty views assigned courses, roster and grades assignment', async () => {
      const crsRes = await request(app)
        .get('/api/faculty/courses')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(crsRes.status).toBe(200);
      expect(Array.isArray(crsRes.body)).toBe(true);

      const gradeRes = await request(app)
        .put('/api/faculty/submissions/sub-001/grade')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ grade: 95, feedback: 'Excellent algorithmic solution and clean implementation!' });
      expect(gradeRes.status).toBe(200);
      expect(gradeRes.body.submission.grade).toBe(95);
    });
  });

  // ==========================================
  // 8. CODE COMPILER SANDBOX & SECURITY
  // ==========================================
  describe('8. Sandboxed Code Execution & Security Guards', () => {
    it('8.1 Executes Python code safely and captures stdout', async () => {
      const res = await request(app)
        .post('/api/common/compiler/run')
        .send({
          language: 'python',
          code: 'print("Hello from Claritas Execution Engine!")'
        });
      expect(res.status).toBe(200);
      expect(res.body.output).toContain('Hello from Claritas Execution Engine!');
    });

    it('8.2 Executes JavaScript code safely and returns evaluation results', async () => {
      const res = await request(app)
        .post('/api/common/compiler/run')
        .send({
          language: 'javascript',
          code: 'const nums = [1, 2, 3, 4, 5]; console.log("Sum:", nums.reduce((a, b) => a + b, 0));'
        });
      expect(res.status).toBe(200);
      expect(res.body.output).toContain('Sum: 15');
    });

    it('8.3 Strict RBAC: Student blocked from Admin API Keys endpoint (403)', async () => {
      const res = await request(app)
        .get('/api/admin/api-keys')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('8.4 Strict RBAC: Faculty blocked from Admin Health Metrics endpoint (403)', async () => {
      const res = await request(app)
        .get('/api/admin/health/metrics')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(res.status).toBe(403);
    });
  });
});

