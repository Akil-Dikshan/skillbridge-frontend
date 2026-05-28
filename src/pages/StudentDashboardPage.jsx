import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getStudentBookings, cancelBooking } from '@/api/bookingApi';
import { getProfile, getMentors } from '@/api/userApi';
import ReviewModal from '@/components/booking/ReviewModal';
import { Clock, Video, ChevronRight, Star, ArrowRight } from 'lucide-react';

const sg = { fontFamily: "'Space Grotesk', sans-serif" };

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmed', color: '#059669', bg: '#D1FAE5' },
  COMPLETED: { label: 'Completed', color: '#6B7280', bg: '#F3F4F6' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' },
};

const ACCENT = {
  PENDING:   '#F59E0B',
  CONFIRMED: '#10B981',
  COMPLETED: '#9CA3AF',
  CANCELLED: '#F87171',
};

const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const getDateParts = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    day:     d.getDate(),
    month:   d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
  };
};

const avatarGradients = [
  'linear-gradient(135deg, #4F46E5, #7C3AED)',
  'linear-gradient(135deg, #0EA5E9, #2563EB)',
  'linear-gradient(135deg, #10B981, #0D9488)',
  'linear-gradient(135deg, #F59E0B, #EF4444)',
  'linear-gradient(135deg, #EC4899, #8B5CF6)',
];
const getGradient = (id) => avatarGradients[(id || 0) % avatarGradients.length];

const StudentDashboardPage = () => {
  const { user, logoutContext } = useAuth();
  const [bookings, setBookings]       = useState([]);
  const [profile, setProfile]         = useState(null);
  const [mentors, setMentors]         = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);
  const [activeTab, setActiveTab]     = useState('upcoming');
  const [reviewedIds, setReviewedIds] = useState(new Set());

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bookingData, profileData, mentorData] = await Promise.allSettled([
        getStudentBookings(),
        getProfile(user.userId),
        getMentors(),
      ]);
      if (bookingData.status  === 'fulfilled') setBookings(bookingData.value || []);
      if (profileData.status  === 'fulfilled') setProfile(profileData.value);
      if (mentorData.status   === 'fulfilled') setMentors((mentorData.value || []).slice(0, 4));
    } catch {
      setError('Failed to load your dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) fetchData();
  }, [user]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this session?')) return;
    try {
      await cancelBooking(bookingId, 'Student requested cancellation');
      fetchData();
    } catch {
      alert('Failed to cancel booking.');
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED');
  const pastBookings     = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
  const completedCount   = bookings.filter(b => b.status === 'COMPLETED').length;
  const displayList      = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const firstName = profile?.firstName || user?.email?.split('@')[0] || 'there';
  const initials  = firstName.slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
            >
              {initials}
            </div>
            <div>
              <h1 style={sg} className="text-2xl font-bold text-gray-900 leading-tight">
                Hey, {firstName}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))}
            </div>
            <div className="space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-base text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT — Sessions */}
            <div className="lg:col-span-2 space-y-6">

              {/* Stats strip */}
              <div className="bg-white rounded-2xl border border-gray-100 px-8 py-6 flex items-center gap-10">
                <div>
                  <p style={sg} className="text-4xl font-bold text-gray-900">{upcomingBookings.length}</p>
                  <p className="text-sm text-gray-400 mt-1">Upcoming</p>
                </div>
                <div className="w-px h-12 bg-gray-100" />
                <div>
                  <p style={sg} className="text-4xl font-bold text-gray-900">{completedCount}</p>
                  <p className="text-sm text-gray-400 mt-1">Completed</p>
                </div>
                <div className="w-px h-12 bg-gray-100" />
                <div>
                  <p style={sg} className="text-4xl font-bold text-gray-900">{bookings.length}</p>
                  <p className="text-sm text-gray-400 mt-1">Total bookings</p>
                </div>
              </div>

              {/* Sessions card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                {/* Tab bar */}
                <div className="flex border-b border-gray-100 px-7 pt-6 gap-1">
                  {[
                    { key: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
                    { key: 'history',  label: 'Past',     count: pastBookings.length },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-2.5 mb-[-1px] text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? 'text-indigo-600 border-indigo-500 bg-indigo-50/50'
                          : 'text-gray-400 border-transparent hover:text-gray-600'
                      }`}
                    >
                      {tab.label}
                      <span className="ml-2 text-xs opacity-60">{tab.count}</span>
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {displayList.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-gray-100 py-16 text-center">
                      <p style={sg} className="text-base font-semibold text-gray-600 mb-2">
                        {activeTab === 'upcoming' ? 'No upcoming sessions' : 'No past sessions yet'}
                      </p>
                      <p className="text-sm text-gray-400 mb-6">
                        {activeTab === 'upcoming'
                          ? 'Find a mentor and book your first session.'
                          : 'Your session history will appear here.'}
                      </p>
                      {activeTab === 'upcoming' && (
                        <Link
                          to="/mentors"
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl"
                          style={{ background: '#4F46E5' }}
                        >
                          Browse Mentors <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayList.map((booking) => {
                        const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                        const accent = ACCENT[booking.status] || '#9CA3AF';
                        const { day, month, weekday } = getDateParts(booking.bookingDate);
                        return (
                          <div
                            key={booking.id}
                            className="flex items-stretch rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all"
                          >
                            {/* Accent bar */}
                            <div className="w-1.5 flex-shrink-0" style={{ background: accent }} />

                            {/* Date block */}
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 bg-gray-50 border-r border-gray-100 py-4 px-2">
                              <span className="text-xs font-bold text-gray-400 tracking-wider">{month}</span>
                              <span style={sg} className="text-3xl font-bold text-gray-800 leading-none mt-1">{day}</span>
                              <span className="text-xs text-gray-400 mt-1">{weekday}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                              <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <Link
                                    to={`/mentors/${booking.mentorId}`}
                                    style={sg}
                                    className="text-base font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                                  >
                                    Mentor #{booking.mentorId}
                                  </Link>
                                  <span
                                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                    style={{ color: cfg.color, background: cfg.bg }}
                                  >
                                    {cfg.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                                  {booking.startTime && (
                                    <span className="flex items-center gap-1.5 text-sm text-gray-400">
                                      <Clock className="w-3.5 h-3.5" />
                                      {fmtTime(booking.startTime)} · {booking.durationMinutes} min
                                    </span>
                                  )}
                                  {booking.status === 'CONFIRMED' && (
                                    <span className="flex items-center gap-1.5 text-sm text-emerald-500">
                                      <Video className="w-3.5 h-3.5" />
                                      Link via email
                                    </span>
                                  )}
                                </div>
                                {booking.notes && (
                                  <p className="mt-1.5 text-sm text-gray-400 italic line-clamp-1">"{booking.notes}"</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {booking.status === 'COMPLETED' && !reviewedIds.has(booking.id) && (
                                  <ReviewModal
                                    bookingId={booking.id}
                                    mentorId={booking.mentorId}
                                    mentorName={`Mentor #${booking.mentorId}`}
                                    onSuccess={() => {
                                      setReviewedIds(prev => new Set([...prev, booking.id]));
                                      fetchData();
                                    }}
                                  />
                                )}
                                {booking.status === 'COMPLETED' && reviewedIds.has(booking.id) && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-xl">
                                    <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" /> Reviewed
                                  </span>
                                )}
                                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                  <button
                                    onClick={() => handleCancel(booking.id)}
                                    className="text-sm text-gray-400 hover:text-red-500 transition-colors px-4 py-2 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-6">

              {/* Discover Mentors */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <h2 style={sg} className="text-base font-bold text-gray-900">Explore Mentors</h2>
                  <Link
                    to="/mentors"
                    className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5"
                  >
                    See all <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="divide-y divide-gray-50">
                  {mentors.length === 0 ? (
                    <div className="px-6 pb-6 text-center">
                      <p className="text-sm text-gray-400">No mentors found.</p>
                    </div>
                  ) : mentors.map((mentor) => {
                    const name = [mentor.firstName, mentor.lastName].filter(Boolean).join(' ') || `Mentor #${mentor.userId}`;
                    const mInitials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const rating = mentor.averageRating ? parseFloat(mentor.averageRating) : 0;
                    const skills = mentor.skills ? mentor.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

                    return (
                      <Link
                        key={mentor.userId}
                        to={`/mentors/${mentor.userId}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                      >
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ background: getGradient(mentor.userId) }}
                        >
                          {mInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={sg} className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                            {name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {rating > 0 ? (
                              <span className="flex items-center gap-1 text-xs text-amber-500">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {rating.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">New</span>
                            )}
                            {skills[0] && (
                              <span className="text-xs text-gray-400 truncate">· {skills[0]}</span>
                            )}
                          </div>
                        </div>
                        <span style={sg} className="text-sm font-semibold text-indigo-600 flex-shrink-0">
                          LKR {mentor.hourlyRate}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <div className="px-6 py-4 border-t border-gray-50">
                  <Link
                    to="/mentors"
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                  >
                    Browse all mentors <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* How it works */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 style={sg} className="text-base font-bold text-gray-900 mb-5">How it works</h2>
                <div className="space-y-5">
                  {[
                    { step: '1', title: 'Find a mentor', desc: 'Browse by skill, rate, or availability.' },
                    { step: '2', title: 'Book a session', desc: 'Pick a time that works for you.' },
                    { step: '3', title: 'Meet & learn',   desc: 'Join via the link sent to your email.' },
                  ].map(item => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
                        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                      >
                        {item.step}
                      </div>
                      <div>
                        <p style={sg} className="text-sm font-semibold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardPage;
