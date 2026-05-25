import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MentorListPage from './pages/MentorListPage';
import MentorProfilePage from './pages/MentorProfilePage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import MentorDashboardPage from './pages/MentorDashboardPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/mentors" element={<MentorListPage />} />
            <Route path="/mentors/:id" element={<MentorProfilePage />} />
            <Route path="/dashboard" element={<StudentDashboardPage />} />
            <Route path="/mentor-dashboard" element={<MentorDashboardPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* We will add more routes later */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
