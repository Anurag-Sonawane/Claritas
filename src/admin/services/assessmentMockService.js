// Mock service for Assessment, Grading, and Certification modules

export const MOCK_ASSESSMENTS = [
  { id: 'asm-1', title: 'Midterm Exam: React Patterns', course: 'Advanced Web Dev', attempts: 45, avgScore: '82%', status: 'Published' },
  { id: 'asm-2', title: 'Final Project Submission', course: 'UI/UX Design', attempts: 12, avgScore: 'N/A', status: 'Draft' },
  { id: 'asm-3', title: 'Weekly Quiz 4', course: 'Database Systems', attempts: 120, avgScore: '91%', status: 'Published' },
];

export const MOCK_QUESTION_BANK = [
  { id: 'q-1', text: 'Which React hook is used for side effects?', type: 'MCQ', difficulty: 'Easy', tags: ['React', 'Hooks', 'Basics'], options: ['useState', 'useEffect', 'useReducer', 'useMemo'], answer: 'useEffect' },
  { id: 'q-2', text: 'Explain the Virtual DOM.', type: 'Essay', difficulty: 'Medium', tags: ['React', 'Performance'], points: 10 },
  { id: 'q-3', text: 'Implement a binary search tree in JS.', type: 'Code', difficulty: 'Hard', tags: ['Algorithms', 'JavaScript'], points: 20 },
  { id: 'q-4', text: 'Select all features introduced in ES6.', type: 'Multi-select', difficulty: 'Medium', tags: ['JavaScript', 'ES6'], options: ['Arrow Functions', 'Promises', 'var keyword', 'Let/Const'], answers: ['Arrow Functions', 'Promises', 'Let/Const'] },
];

export const MOCK_GRADING_QUEUE = [
  { id: 'sub-1', student: 'Alice Johnson', assessment: 'Final Project Submission', course: 'UI/UX Design', submittedAt: '2026-04-08T10:30:00Z', status: 'Pending', type: 'Essay/File' },
  { id: 'sub-2', student: 'Bob Smith', assessment: 'Midterm Exam: React Patterns', course: 'Advanced Web Dev', submittedAt: '2026-04-09T08:15:00Z', status: 'Pending', type: 'Essay/File' },
];

export const MOCK_CERTIFICATE_TEMPLATES = [
  { id: 'cert-1', name: 'Course Completion Certificate', course: 'All Courses', rules: 'Score > 80%', lastEdited: '2026-03-15' },
  { id: 'cert-2', name: 'Honor Roll Certificate', course: 'UI/UX Design', rules: 'Score > 95%', lastEdited: '2026-01-20' },
];

export const getAssessments = async () => {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_ASSESSMENTS), 500));
};

export const getQuestionBank = async () => {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_QUESTION_BANK), 400));
};

export const getGradingQueue = async () => {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_GRADING_QUEUE), 600));
};

export const simulatePlagiarismCheck = async (text) => {
  return new Promise(resolve => setTimeout(() => {
    // Generate a mock similarity score between 0 and 100
    const mockScore = Math.floor(Math.random() * 30); // Mostly likely original, sometimes slight match
    resolve({
      similarity: mockScore,
      matches: mockScore > 10 ? [{ text: "Virtual DOM is a programming concept...", source: "Wikipedia" }] : []
    });
  }, 1500));
};

export const submitGrade = async (submissionId, score, feedback) => {
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 800));
};
