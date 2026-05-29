import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MentorListPage from './pages/MentorListPage';
import MentorProfilePage from './pages/MentorProfilePage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import MentorDashboardPage from './pages/MentorDashboardPage';
import MentorOnboardingPage from './pages/MentorOnboardingPage';
import AppLayout from './components/layout/AppLayout';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Public route with navbar — accessible without login.
function PublicRoute({ children }) {
  return <AppLayout>{children}</AppLayout>;
}

// Standard protected route — wraps content in AppLayout (navbar + bg).
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <AppLayout>{children}</AppLayout>;
}

// Protected route without AppLayout — for pages that own their full layout (e.g. onboarding).
function ProtectedPage({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen font-sans">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/mentors" element={<PublicRoute><MentorListPage /></PublicRoute>} />
            <Route path="/mentors/:id" element={<PublicRoute><MentorProfilePage /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
            <Route path="/mentor-dashboard" element={<ProtectedRoute><MentorDashboardPage /></ProtectedRoute>} />
            <Route path="/mentor/onboarding" element={<ProtectedPage><MentorOnboardingPage /></ProtectedPage>} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
