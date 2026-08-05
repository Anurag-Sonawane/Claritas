const API_BASE_URL = 'http://localhost:5000/api';

function getAuthHeader() {
  const token = localStorage.getItem('claritas_token') || sessionStorage.getItem('claritas_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async register(registrationData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    return data.user;
  },

  // Courses & Rosters
  async getCourses() {
    const res = await fetch(`${API_BASE_URL}/courses`);
    return await res.json();
  },

  async getCourseRoster(courseId) {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/roster`);
    return await res.json();
  },

  // Assignments
  async getAssignments() {
    const res = await fetch(`${API_BASE_URL}/assignments`);
    return await res.json();
  },

  async createAssignment(assignmentData) {
    const res = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(assignmentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create assignment');
    return data;
  },

  // Submissions & Grading
  async getSubmissions() {
    const res = await fetch(`${API_BASE_URL}/submissions`);
    return await res.json();
  },

  async gradeSubmission(submissionId, score, feedback) {
    const res = await fetch(`${API_BASE_URL}/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ score, feedback }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update grade');
    return data;
  },

  async submitAssignment(assignmentId, content) {
    const res = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ assignment_id: assignmentId, content }),
    });
    return await res.json();
  },

  // Attendance
  async getAttendance(courseId, date) {
    const res = await fetch(`${API_BASE_URL}/attendance?course_id=${courseId}&date=${date}`);
    return await res.json();
  },

  async saveAttendanceSession(courseId, date, records) {
    const res = await fetch(`${API_BASE_URL}/attendance/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ course_id: courseId, date, records }),
    });
    return await res.json();
  },

  // Student Panel Specific APIs
  async getStudentDashboard() {
    const res = await fetch(`${API_BASE_URL}/student/dashboard`, {
      headers: { ...getAuthHeader() },
    });
    return await res.json();
  },

  async getStudentAttendance() {
    const res = await fetch(`${API_BASE_URL}/student/attendance`, {
      headers: { ...getAuthHeader() },
    });
    return await res.json();
  },

  async getStudentCalendar() {
    const res = await fetch(`${API_BASE_URL}/student/calendar`, {
      headers: { ...getAuthHeader() },
    });
    return await res.json();
  },

  async getAnnouncements() {
    const res = await fetch(`${API_BASE_URL}/announcements`);
    return await res.json();
  },

  async createAnnouncement(data) {
    const res = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async getTickets() {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      headers: { ...getAuthHeader() },
    });
    return await res.json();
  },

  async createTicket(data) {
    const res = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async getStudentFees() {
    const res = await fetch(`${API_BASE_URL}/student/fees`, {
      headers: { ...getAuthHeader() },
    });
    return await res.json();
  },

  async payStudentFees() {
    const res = await fetch(`${API_BASE_URL}/student/fees/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    return await res.json();
  },

  async getAssessments() {
    const res = await fetch(`${API_BASE_URL}/assessments`);
    return await res.json();
  },

  // Sandbox Compiler
  async runCompiler(code, language = 'javascript') {
    const res = await fetch(`${API_BASE_URL}/compiler/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    return await res.json();
  },

  // AI Endpoints
  async summarizeNotes(text) {
    const res = await fetch(`${API_BASE_URL}/ai/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return await res.json();
  }
};
