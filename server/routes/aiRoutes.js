import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Allow authenticated users to access AI study tools
router.use(authenticateToken);

// ── Smart Extraction Helpers ──
function extractKeySentences(text, maxCount = 4) {
  if (!text || typeof text !== 'string') return [];
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
  
  if (sentences.length <= maxCount) return sentences;
  const step = Math.floor(sentences.length / maxCount);
  return Array.from({ length: maxCount }, (_, i) => sentences[Math.min(i * step, sentences.length - 1)]);
}

// ── 1. Summarize Endpoint ──
router.post('/summarize', (req, res) => {
  const { text, title = 'Lecture Notes' } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Source text or lecture content is required for summarization' });
  }

  const rawText = text.trim();
  const sentences = extractKeySentences(rawText, 5);
  const words = rawText.split(/\s+/).length;

  const executiveSummary = sentences.length > 0
    ? sentences.slice(0, 2).join(' ')
    : `Comprehensive synthesis of ${title}, outlining fundamental computational principles and structured findings.`;

  const bullets = sentences.length > 2
    ? sentences.slice(1).map(s => s.replace(/^[•\-\d.]\s*/, ''))
    : [
        'Core concepts broken down into modular thematic sections for structured review.',
        'Key analytical takeaways prioritized for examination preparation.',
        'Action items and recommended practice problems aligned with syllabus requirements.'
      ];

  res.json({
    title: title || 'Executive Study Summary',
    wordCount: words,
    readingTime: `${Math.max(1, Math.ceil(words / 150))} min read`,
    exec: executiveSummary,
    bullets,
    generatedAt: new Date().toISOString()
  });
});

// ── 2. Flashcards Generator Endpoint ──
router.post('/flashcards', (req, res) => {
  const { topic = '', count = 4, notes = '' } = req.body;
  const cleanTopic = topic.trim() || 'Core Computer Science Concepts';
  const targetCount = Math.min(Math.max(parseInt(count, 10) || 4, 1), 12);

  const sentences = notes ? extractKeySentences(notes, targetCount) : [];

  let flashcards = [];
  if (sentences.length >= 2) {
    flashcards = sentences.map((s, idx) => ({
      id: `card-${idx + 1}`,
      q: `Key concept ${idx + 1} regarding ${cleanTopic}: What is the significance of this principle?`,
      a: s,
      difficulty: idx % 3 === 0 ? 'Hard' : idx % 2 === 0 ? 'Medium' : 'Easy'
    }));
  } else {
    // Topic-tailored structured flashcard deck
    flashcards = [
      {
        id: 'card-1',
        q: `What is the core definition and purpose of ${cleanTopic}?`,
        a: `${cleanTopic} establishes foundational architectural paradigms used to model, analyze, and optimize computational systems.`,
        difficulty: 'Easy'
      },
      {
        id: 'card-2',
        q: `What primary trade-offs or constraints occur when implementing ${cleanTopic}?`,
        a: `Key trade-offs typically involve space vs. time complexity, scalability under high concurrency, and data consistency across distributed nodes.`,
        difficulty: 'Medium'
      },
      {
        id: 'card-3',
        q: `How is ${cleanTopic} evaluated and benchmarked in production?`,
        a: `Evaluated through empirical profiling, asymptotic Big-O analysis, load testing, and telemetry tracking against standard service level objectives.`,
        difficulty: 'Medium'
      },
      {
        id: 'card-4',
        q: `What edge-cases or failure modes should be anticipated in ${cleanTopic}?`,
        a: `Memory exhaustion, race conditions, boundary condition overflows, and unhandled exception states during input validation.`,
        difficulty: 'Hard'
      },
      {
        id: 'card-5',
        q: `What modern optimizations improve performance in ${cleanTopic}?`,
        a: `Caching strategies, vectorization, lazy evaluation, indexing data structures, and asynchronous non-blocking pipelines.`,
        difficulty: 'Hard'
      }
    ].slice(0, targetCount);
  }

  res.json({
    topic: cleanTopic,
    totalCards: flashcards.length,
    cards: flashcards,
    generatedAt: new Date().toISOString()
  });
});

// ── 3. Pitch Deck / PPT Generator Endpoint ──
router.post('/ppt', (req, res) => {
  const { topic = '', audience = 'Undergraduate Students', slidesCount = 5 } = req.body;
  const cleanTopic = topic.trim() || 'Modern Computing Architecture';
  const numSlides = Math.min(Math.max(parseInt(slidesCount, 10) || 5, 3), 10);

  const defaultTemplates = [
    {
      title: `${cleanTopic}`,
      subtitle: `An Academic & Practical Overview for ${audience}`,
      bullets: [
        'Claritas Engineering & Applied Sciences',
        `Tailored Presentation Level: ${audience}`,
        `Academic Term ${new Date().getFullYear()}`
      ],
      notes: 'Introduce topic, state presentation goals, and outline learning objectives.'
    },
    {
      title: 'Agenda & Learning Objectives',
      subtitle: 'Structured roadmap of today\'s discussion',
      bullets: [
        'Theoretical Foundations and Motivation',
        'System Architecture & Core Mechanics',
        'Empirical Analysis & Practical Demonstration',
        'Summary, Resources & Open Discussion'
      ],
      notes: 'Provide a high-level table of contents so the audience can anchor the flow.'
    },
    {
      title: `The Core Mechanics of ${cleanTopic}`,
      subtitle: 'Deconstructing the foundational components',
      bullets: [
        'Primary computational abstractions and data structures.',
        'Control-flow mechanisms and execution pipelines.',
        'Invariant conditions and deterministic state transitions.'
      ],
      notes: 'Dive into the conceptual core. Use diagrams or code snippets here.'
    },
    {
      title: 'Practical Applications & Case Study',
      subtitle: 'Bridging theory with industry production implementations',
      bullets: [
        'Real-world deployments across distributed architectures.',
        'Performance comparisons against legacy benchmarks.',
        'Quantified efficiency gains in latency and resource footprint.'
      ],
      notes: 'Highlight tangible results, metrics, and industry case studies.'
    },
    {
      title: 'Summary & Key Takeaways',
      subtitle: 'Core principles to remember',
      bullets: [
        `Mastery of ${cleanTopic} provides a strategic engineering foundation.`,
        'Prioritize algorithmic efficiency and defensive validation.',
        'Next steps: Complete assigned lab coursework and interactive sandboxes.'
      ],
      notes: 'Reiterate top 3 points and invite questions from the audience.'
    }
  ];

  const slides = defaultTemplates.slice(0, numSlides).map((s, idx) => ({
    id: idx + 1,
    title: s.title,
    subtitle: s.subtitle,
    bullets: s.bullets,
    body: s.bullets.map(b => `- ${b}`).join('\n'),
    notes: s.notes
  }));

  res.json({
    topic: cleanTopic,
    audience,
    totalSlides: slides.length,
    deck: slides,
    generatedAt: new Date().toISOString()
  });
});

export default router;
