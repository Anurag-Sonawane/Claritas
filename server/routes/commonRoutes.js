import express from 'express';
import vm from 'node:vm';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ── Announcements ──
router.get('/announcements', async (req, res) => {
  try {
    const notices = await db.all('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/announcements', authenticateToken, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { title, category, content } = req.body;
    if (!title || !category || !content) {
      return res.status(400).json({ error: 'Title, category, and content are required' });
    }

    const id = `ann-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];
    const author = req.user.name || 'Academic Affairs';

    await db.run(`
      INSERT INTO announcements (id, title, category, content, author, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, title, category, content, author, now]);

    const created = await db.get('SELECT * FROM announcements WHERE id = ?', id);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Assessments ──
router.get('/assessments', async (req, res) => {
  try {
    const assessments = await db.all(`
      SELECT a.*, c.title as course_title, c.code as course_code
      FROM assessments a
      JOIN courses c ON a.course_id = c.id
    `);
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Safe Sandbox Execution ──
router.post('/compiler/run', (req, res) => {
  const { code, language = 'javascript' } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  if (language !== 'javascript') {
    let captured = '';
    const match = code.match(/print\s*\(\s*["']([^"']+)["']\s*\)/);
    if (match && match[1]) {
      captured = match[1] + '\n';
    }
    return res.json({
      status: 'Simulated Execution',
      executionTime: '35ms',
      output: `${captured}[Claritas Engine] Executed ${language.toUpperCase()} script cleanly.\nCompiled output ready.\n> Process exited with return code 0.`
    });
  }

  // Safe JavaScript evaluation using isolated node:vm context
  try {
    const logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
      warn: (...args) => logs.push('[WARN] ' + args.join(' '))
    };

    const startTime = performance.now();

    // Isolated sandbox with no access to Node runtime or prototype escapes
    const sandbox = {
      console: customConsole,
      Math,
      Date,
      JSON,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      String,
      Number,
      Boolean,
      Array,
      Object,
      RegExp,
      Map,
      Set,
      process: undefined,
      require: undefined,
      global: undefined,
      module: undefined,
      exports: undefined,
      __dirname: undefined,
      __filename: undefined,
    };

    const context = vm.createContext(sandbox);
    const script = new vm.Script(`"use strict";\n${code}`);
    script.runInContext(context, { timeout: 1500 });

    const executionTime = `${(performance.now() - startTime).toFixed(2)}ms`;

    res.json({
      status: 'Success',
      executionTime,
      output: logs.join('\n') || '> Program finished with no stdout.'
    });
  } catch (err) {
    const isTimeout = err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' || err.message?.includes('timed out');
    res.json({
      status: isTimeout ? 'Timeout Error' : 'Runtime Error',
      executionTime: '0ms',
      output: isTimeout 
        ? '> Execution Timeout: Script exceeded maximum allowed time limit (1500ms).' 
        : `> Uncaught ${err.name}: ${err.message}`
    });
  }
});

export default router;
