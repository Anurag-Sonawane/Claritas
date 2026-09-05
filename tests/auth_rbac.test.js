import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { initDatabase } from '../server/db.js';

describe('Auth & RBAC Security Suite', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  let adminToken = '';
  let studentToken = '';
  let refreshToken = '';

  it('1. Admin can login and receive JWT access token + refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@claritas.edu', password: 'password' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  it('2. Student can login and receive student credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@claritas.edu', password: 'password' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('student');
    studentToken = res.body.token;
  });

  it('3. Unauthenticated requests to protected endpoints return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Authentication required/i);
  });

  it('4. RBAC: Student token accessing Admin endpoints receives 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Forbidden/i);
  });

  it('5. RBAC: Admin token accessing Admin endpoints succeeds with 200 OK', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users).toBeDefined();
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('6. Refresh Token rotation issues new access token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('7. Logout revokes refresh token and prevents reuse', async () => {
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);

    const refreshAfterLogout = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(refreshAfterLogout.status).toBe(403);
  });

  it('8. Safe Sandbox prevents arbitrary environment / process leakage', async () => {
    const res = await request(app)
      .post('/api/compiler/run')
      .send({ code: 'console.log(typeof process, typeof require);', language: 'javascript' });

    expect(res.status).toBe(200);
    expect(res.body.output).toContain('undefined undefined');
  });
});
