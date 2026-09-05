import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Auth & Error
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Student Pages
const Home = lazy(() => import('./pages/Home'));
const Assignments = lazy(() => import('./pages/Assignments'));
const Assessments = lazy(() => import('./pages/Assessments'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Fees = lazy(() => import('./pages/Fees'));
const Complaints = lazy(() => import('./pages/Complaints'));
const ProctoredTest = lazy(() => import('./pages/ProctoredTest'));
const About = lazy(() => import('./pages/About'));
const Compiler = lazy(() => import('./pages/Compiler'));

// AI Pages
const AiHub = lazy(() => import('./pages/AiHub'));
const AiSummary = lazy(() => import('./pages/AiSummary'));
const AiFlashcards = lazy(() => import('./pages/AiFlashcards'));
const AiPptMaker = lazy(() => import('./pages/AiPptMaker'));

// Admin Imports & Pages
import AdminLayout from './admin/layouts/AdminLayout';
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const UsersPage = lazy(() => import('./admin/pages/UsersPage'));
const RolesPage = lazy(() => import('./admin/pages/RolesPage'));
const AuditLogPage = lazy(() => import('./admin/pages/AuditLogPage'));
const CoursesPage = lazy(() => import('./admin/pages/CoursesPage'));
const CourseEditorPage = lazy(() => import('./admin/pages/CourseEditorPage'));
const AssessmentsPage = lazy(() => import('./admin/pages/AssessmentsPage'));
const AssessmentBuilder = lazy(() => import('./admin/pages/AssessmentBuilder'));
const GradingQueuePage = lazy(() => import('./admin/pages/GradingQueuePage'));
const GraderView = lazy(() => import('./admin/pages/GraderView'));
const CertificatesPage = lazy(() => import('./admin/pages/CertificatesPage'));
const SettingsPage = lazy(() => import('./admin/pages/SettingsPage'));
const EngagementFunnels = lazy(() => import('./admin/pages/EngagementFunnels'));
const CohortAnalysis = lazy(() => import('./admin/pages/CohortAnalysis'));
const DropoffHeatmaps = lazy(() => import('./admin/pages/DropoffHeatmaps'));
const ReportBuilder = lazy(() => import('./admin/pages/ReportBuilder'));
const SystemHealth = lazy(() => import('./admin/pages/SystemHealth'));

import SettingsLayout from './admin/layouts/SettingsLayout';
const IntegrationsPage = lazy(() => import('./admin/pages/IntegrationsPage'));
const SecurityPage = lazy(() => import('./admin/pages/SecurityPage'));
const ApiKeysPage = lazy(() => import('./admin/pages/ApiKeysPage'));
const WebhooksPage = lazy(() => import('./admin/pages/WebhooksPage'));
const GdprPage = lazy(() => import('./admin/pages/GdprPage'));

// Faculty Imports & Pages
import FacultyLayout from './faculty/layouts/FacultyLayout';
const FacultyDashboard = lazy(() => import('./faculty/pages/FacultyDashboard'));
const MyClassesPage = lazy(() => import('./faculty/pages/MyClassesPage'));
const FacultyGradingPage = lazy(() => import('./faculty/pages/FacultyGradingPage'));
const FacultyAttendancePage = lazy(() => import('./faculty/pages/FacultyAttendancePage'));
const FacultyAssignmentsPage = lazy(() => import('./faculty/pages/FacultyAssignmentsPage'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background, #0a0a0f)' }}>
              <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary, #6366f1)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          }>
            <Routes>
              {/* Public Authentication Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Student Dashboard */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Home />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="assessments" element={<Assessments />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="fees" element={<Fees />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="proctored-test" element={<ProctoredTest />} />
                <Route path="compiler" element={<Compiler />} />
                <Route path="about" element={<About />} />
                
                <Route path="ai">
                  <Route index element={<AiHub />} />
                  <Route path="summary" element={<AiSummary />} />
                  <Route path="flashcards" element={<AiFlashcards />} />
                  <Route path="ppt" element={<AiPptMaker />} />
                </Route>
              </Route>

              {/* Faculty Dashboard */}
              <Route 
                path="/faculty" 
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                    <FacultyLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<FacultyDashboard />} />
                <Route path="classes" element={<MyClassesPage />} />
                <Route path="grading" element={<FacultyGradingPage />} />
                <Route path="attendance" element={<FacultyAttendancePage />} />
                <Route path="assignments" element={<FacultyAssignmentsPage />} />
                <Route path="compiler" element={<Compiler />} />
                <Route path="ai">
                  <Route index element={<AiHub />} />
                  <Route path="ppt" element={<AiPptMaker />} />
                  <Route path="summary" element={<AiSummary />} />
                  <Route path="flashcards" element={<AiFlashcards />} />
                </Route>
              </Route>

              {/* Admin Dashboard */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="compiler" element={<Compiler />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="roles" element={<RolesPage />} />
                <Route path="audit-logs" element={<AuditLogPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:courseId/edit" element={<CourseEditorPage />} />
                <Route path="assessments" element={<AssessmentsPage />} />
                <Route path="assessments/new" element={<AssessmentBuilder />} />
                <Route path="grading" element={<GradingQueuePage />} />
                <Route path="grading/:submissionId" element={<GraderView />} />
                <Route path="certificates" element={<CertificatesPage />} />
                <Route path="analytics/engagement" element={<EngagementFunnels />} />
                <Route path="analytics/cohorts" element={<CohortAnalysis />} />
                <Route path="analytics/dropoffs" element={<DropoffHeatmaps />} />
                <Route path="reports" element={<ReportBuilder />} />
                <Route path="health" element={<SystemHealth />} />
                
                <Route path="settings" element={<SettingsLayout />}>
                  <Route index element={<Navigate to="integrations" replace />} />
                  <Route path="integrations" element={<IntegrationsPage />} />
                  <Route path="security" element={<SecurityPage />} />
                  <Route path="api-keys" element={<ApiKeysPage />} />
                  <Route path="webhooks" element={<WebhooksPage />} />
                  <Route path="gdpr" element={<GdprPage />} />
                </Route>

                <Route path="ai">
                  <Route index element={<AiHub />} />
                  <Route path="ppt" element={<AiPptMaker />} />
                  <Route path="summary" element={<AiSummary />} />
                  <Route path="flashcards" element={<AiFlashcards />} />
                </Route>
              </Route>

              {/* 404 Catch-All Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
