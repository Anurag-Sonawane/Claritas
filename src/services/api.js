import { apiClient, API_BASE_URL, clearAuthStorage, setTokens, getRefreshToken } from './apiClient';

export { API_BASE_URL };

export const api = {
  // ── Auth ──
  async register(registrationData) {
    return await apiClient.post('/auth/register', registrationData);
  },

  async login(email, password, rememberMe = false) {
    const data = await apiClient.post('/auth/login', { email, password, rememberMe });
    setTokens({ token: data.token, refreshToken: data.refreshToken, rememberMe });
    return data;
  },

  async logout() {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.warn('Backend logout notification skipped:', e.message);
    } finally {
      clearAuthStorage();
    }
  },

  async getCurrentUser() {
    const data = await apiClient.get('/auth/me');
    return data.user;
  },

  // ── Courses & Rosters ──
  async getCourses() {
    return await apiClient.get('/courses');
  },

  async getCourseRoster(courseId) {
    return await apiClient.get(`/courses/${courseId}/roster`);
  },

  // ── Assignments ──
  async getAssignments() {
    return await apiClient.get('/assignments');
  },

  async createAssignment(assignmentData) {
    return await apiClient.post('/assignments', assignmentData);
  },

  // ── Submissions & Grading ──
  async getSubmissions() {
    return await apiClient.get('/submissions');
  },

  async gradeSubmission(submissionId, score, feedback) {
    return await apiClient.patch(`/submissions/${submissionId}/grade`, { score, feedback });
  },

  async submitAssignment(assignmentId, content) {
    return await apiClient.post('/submissions', { assignment_id: assignmentId, content });
  },

  // ── Attendance ──
  async getAttendance(courseId, date) {
    return await apiClient.get(`/attendance?course_id=${courseId}&date=${date}`);
  },

  async saveAttendanceSession(courseId, date, records) {
    return await apiClient.post('/attendance/session', { course_id: courseId, lecture_date: date, records });
  },

  // ── Student Panel Specific APIs ──
  async getStudentDashboard() {
    return await apiClient.get('/student/dashboard');
  },

  async getStudentAttendance() {
    return await apiClient.get('/student/attendance');
  },

  async getStudentCalendar() {
    return await apiClient.get('/student/calendar');
  },

  async getAnnouncements() {
    return await apiClient.get('/announcements');
  },

  async createAnnouncement(data) {
    return await apiClient.post('/announcements', data);
  },

  async getTickets() {
    return await apiClient.get('/student/tickets');
  },

  async createTicket(data) {
    return await apiClient.post('/student/tickets', data);
  },

  async getStudentFees() {
    return await apiClient.get('/student/fees');
  },

  async payStudentFees(feeId) {
    return await apiClient.post('/student/fees/pay', { feeId });
  },

  async getAssessments() {
    return await apiClient.get('/assessments');
  },

  // ── Sandbox Compiler ──
  async runCompiler(code, language = 'javascript') {
    return await apiClient.post('/compiler/run', { code, language });
  },

  // ── Real AI Endpoints ──
  async summarizeNotes(text, title = '') {
    return await apiClient.post('/ai/summarize', { text, title });
  },

  async generateFlashcards(topic, count = 5, notes = '') {
    return await apiClient.post('/ai/flashcards', { topic, count, notes });
  },

  async generatePpt(topic, audience = 'Undergraduate Students', slidesCount = 5) {
    return await apiClient.post('/ai/ppt', { topic, audience, slidesCount });
  }
};

export default api;
