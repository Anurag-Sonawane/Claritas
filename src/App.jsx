import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import Assignments from './pages/Assignments';
import Assessments from './pages/Assessments';
import Attendance from './pages/Attendance';
import Calendar from './pages/Calendar';
import Announcements from './pages/Announcements';
import Fees from './pages/Fees';
import Complaints from './pages/Complaints';
import ProctoredTest from './pages/ProctoredTest';
import About from './pages/About';

import AiHub from './pages/AiHub';
import AiSummary from './pages/AiSummary';
import AiFlashcards from './pages/AiFlashcards';
import AiPptMaker from './pages/AiPptMaker';
import Compiler from './pages/Compiler';

// Admin imports
import AdminLayout from './admin/layouts/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import UsersPage from './admin/pages/UsersPage';
import RolesPage from './admin/pages/RolesPage';
import AuditLogPage from './admin/pages/AuditLogPage';
import CoursesPage from './admin/pages/CoursesPage';
import CourseEditorPage from './admin/pages/CourseEditorPage';
import AssessmentsPage from './admin/pages/AssessmentsPage';
import AssessmentBuilder from './admin/pages/AssessmentBuilder';
import GradingQueuePage from './admin/pages/GradingQueuePage';
import GraderView from './admin/pages/GraderView';
import CertificatesPage from './admin/pages/CertificatesPage';
import SettingsPage from './admin/pages/SettingsPage';
import EngagementFunnels from './admin/pages/EngagementFunnels';
import CohortAnalysis from './admin/pages/CohortAnalysis';
import DropoffHeatmaps from './admin/pages/DropoffHeatmaps';
import ReportBuilder from './admin/pages/ReportBuilder';

import SettingsLayout from './admin/layouts/SettingsLayout';
import IntegrationsPage from './admin/pages/IntegrationsPage';
import SecurityPage from './admin/pages/SecurityPage';
import ApiKeysPage from './admin/pages/ApiKeysPage';
import WebhooksPage from './admin/pages/WebhooksPage';
import GdprPage from './admin/pages/GdprPage';
import SystemHealth from './admin/pages/SystemHealth';

// Faculty imports
import FacultyLayout from './faculty/layouts/FacultyLayout';
import FacultyDashboard from './faculty/pages/FacultyDashboard';
import MyClassesPage from './faculty/pages/MyClassesPage';
import FacultyGradingPage from './faculty/pages/FacultyGradingPage';
import FacultyAttendancePage from './faculty/pages/FacultyAttendancePage';
import FacultyAssignmentsPage from './faculty/pages/FacultyAssignmentsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
