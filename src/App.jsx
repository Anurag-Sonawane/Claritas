import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="fees" element={<Fees />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="proctored-test" element={<ProctoredTest />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
