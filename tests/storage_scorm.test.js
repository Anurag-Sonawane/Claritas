import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import AdmZip from 'adm-zip';
import app from '../server/index.js';
import { initDatabase } from '../server/db.js';

describe('Cloud File Storage & SCORM Inspection Engine', () => {
  let adminToken;

  beforeAll(async () => {
    await initDatabase();

    // Login as default admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@claritas.edu', password: 'password' });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.token;
  });

  it('1. Reports active storage provider info', async () => {
    const res = await request(app)
      .get('/api/admin/storage/info')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('provider');
    expect(['local', 'cloudinary', 'supabase']).toContain(res.body.data.provider);
  });

  it('2. Uploads real binary file via multipart form-data and serves statically', async () => {
    const fileBuffer = Buffer.from('PDF Mock Content: Claritas Cloud Storage Architecture Document', 'utf8');

    const uploadRes = await request(app)
      .post('/api/admin/media')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('folder', 'Documentation')
      .attach('file', fileBuffer, 'cloud_arch.pdf');

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.data.name).toBe('cloud_arch.pdf');
    expect(uploadRes.body.data.type).toBe('pdf');
    expect(uploadRes.body.data.cdnUrl).toBeDefined();

    const mediaId = uploadRes.body.data.id;
    const cdnUrl = uploadRes.body.data.cdnUrl;

    // Verify static file serving if provider is local
    if (cdnUrl.startsWith('/uploads/')) {
      const downloadRes = await request(app).get(cdnUrl);
      expect(downloadRes.status).toBe(200);
      const text = downloadRes.text || downloadRes.body?.toString('utf8') || '';
      expect(text).toContain('Claritas Cloud Storage');
    }

    // Clean up uploaded media
    const deleteRes = await request(app)
      .delete(`/api/admin/media/${mediaId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });

  it('3. Validates and stores a compliant SCORM 2004 zip package', async () => {
    // Generate valid SCORM zip in memory with imsmanifest.xml
    const zip = new AdmZip();
    const manifestXml = `<?xml version="1.0" standalone="no" ?>
      <manifest identifier="claritas_scorm_demo" version="1.3"
                xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
                xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3">
        <metadata>
          <schema>ADL SCORM</schema>
          <schemaversion>2004 4th Edition</schemaversion>
        </metadata>
        <organizations default="org_1">
          <organization identifier="org_1">
            <title>Advanced Distributed Algorithms</title>
            <item identifier="item_1" identifierref="res_1">
              <title>Module 1: Consensus</title>
            </item>
            <item identifier="item_2" identifierref="res_2">
              <title>Module 2: Paxos and Raft</title>
            </item>
          </organization>
        </organizations>
        <resources>
          <resource identifier="res_1" type="webcontent" adlcp:scormType="sco" href="index.html">
            <file href="index.html" />
          </resource>
        </resources>
      </manifest>`;

    zip.addFile('imsmanifest.xml', Buffer.from(manifestXml, 'utf8'));
    zip.addFile('index.html', Buffer.from('<html><body>SCORM Player Lesson</body></html>', 'utf8'));
    const zipBuffer = zip.toBuffer();

    const uploadRes = await request(app)
      .post('/api/admin/scorm/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('courseId', 'crs-001')
      .attach('file', zipBuffer, 'algorithms_scorm2004.zip');

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.data.status).toBe('valid');
    expect(uploadRes.body.data.title).toBe('Advanced Distributed Algorithms');
    expect(uploadRes.body.data.version).toContain('2004');
    expect(uploadRes.body.data.errors).toHaveLength(0);
  });

  it('4. Rejects a non-compliant zip package missing imsmanifest.xml', async () => {
    const zip = new AdmZip();
    zip.addFile('random_file.txt', Buffer.from('Not a SCORM manifest', 'utf8'));
    const zipBuffer = zip.toBuffer();

    const uploadRes = await request(app)
      .post('/api/admin/scorm/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('courseId', 'crs-001')
      .attach('file', zipBuffer, 'invalid_package.zip');

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.data.status).toBe('invalid');
    expect(uploadRes.body.data.errors.some(e => e.code === 'MISSING_MANIFEST')).toBe(true);
  });
});
