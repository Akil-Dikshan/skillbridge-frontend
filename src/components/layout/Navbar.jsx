import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Zap, Search, Menu, X, ChevronDown, LogOut, ChevronRight } from 'lucide-react';

const sg = { fontFamily: "'Space Grotesk', sans-serif" };

const CATEGORIES = [
  { label: 'Engineering Mentors', keyword: 'Engineering' },
  { label: 'Data Mentors',        keyword: 'Data' },
  { label: 'DevOps Mentors',      keyword: 'DevOps' },
  { label: 'Design Mentors',      keyword: 'Design' },
  { label: 'AI Mentors',          keyword: 'Machine Learning' },
  { label: 'Product Managers',    keyword: 'Product' },
  { label: 'Security Mentors',    keyword: 'Security' },
  { label: 'Career Coaches',      keyword: 'Career' },
];

const Navbar = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/mentors${search.trim() ? `?skill=${encodeURIComponent(search.trim())}` : ''}`);
    setMobileOpen(false);
  };

  const handleCategory = (keyword) => {
    navigate(`/mentors?skill=${encodeURIComponent(keyword)}`);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  const isMentor = user?.roleType === 'MENTOR';
  const initials = user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">

      {/* Row 1 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex items-center gap-6 h-20">

          <Link
            to={isMentor ? '/mentor-dashboard' : '/dashboard'}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span style={sg} className="font-bold text-gray-900 text-xl hidden sm:block tracking-tight">
              SkillBridge
            </span>
          </Link>

          {!isMentor && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by skill or mentor name"
                  className="w-full h-12 pl-11 pr-4 text-base bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors"
                />
              </div>
            </form>
          )}

          <div className="flex-1" />

          <nav className="hidden md:flex items-center gap-8">
            {!isMentor ? (
              <>
                <Link
                  to="/mentors"
                  className="px-5 py-2.5 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  Browse Mentors
                </Link>
                {user && (
                  <Link
                    to="/dashboard"
                    className="px-5 py-2.5 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    My Dashboard
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/mentor-dashboard"
                className="px-5 py-2.5 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="hidden md:block relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              >
                {initials}
              </div>
              <span className="text-sm text-gray-700 font-medium max-w-[140px] truncate">
                {user?.email}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">Signed in as</p>
                  <p className="text-sm text-gray-800 font-medium truncate mt-0.5">{user?.email}</p>
                  <span
                    className="inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: isMentor ? 'rgba(124,58,237,0.08)' : 'rgba(79,70,229,0.08)',
                      color: isMentor ? '#7C3AED' : '#4F46E5',
                    }}
                  >
                    {isMentor ? 'Mentor' : 'Student'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Row 2 — category nav (students only) */}
      {!isMentor && (
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <div className="relative flex items-center">
              <nav className="flex items-center overflow-x-auto py-1 pr-10" style={{ scrollbarWidth: 'none', gap: '0.25rem' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.keyword}
                    onClick={() => handleCategory(cat.keyword)}
                    className="flex-shrink-0 px-4 py-3 text-base font-semibold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors whitespace-nowrap"
                  >
                    {cat.label}
                  </button>
                ))}
              </nav>
              <div className="absolute right-0 top-0 h-full flex items-center pointer-events-none"
                style={{ background: 'linear-gradient(to right, transparent, white 60%)', width: '4rem' }}>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto mr-1" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-5 space-y-2">
            {!isMentor && (
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by skill or mentor name"
                    className="w-full h-12 pl-11 pr-4 text-base bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </form>
            )}
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">{isMentor ? 'Mentor' : 'Student'}</p>
              </div>
            </div>
            {!isMentor && (
              <>
                <Link
                  to="/mentors"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  Browse Mentors
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  My Dashboard
                </Link>
              </>
            )}
            {isMentor && (
              <Link
                to="/mentor-dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
