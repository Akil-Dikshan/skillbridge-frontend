import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfile, getMentorProfile, getMentorAvailability, getWorkExperience, getEducation } from '@/api/userApi';
import { getMentorReviews } from '@/api/reviewApi';
import BookingModal from '@/components/booking/BookingModal';
import { MapPin, Star, CheckCircle, Home, ChevronRight, Briefcase, GraduationCap, FileText, MessageCircle } from 'lucide-react';

const sg = { fontFamily: "'Space Grotesk', sans-serif" };

const HERO_DARK   = '#1a1756';
const HERO_DARKER = '#130f47';

const DAY_ORDER = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const DAYS_FULL = { MONDAY:'Monday',TUESDAY:'Tuesday',WEDNESDAY:'Wednesday',THURSDAY:'Thursday',FRIDAY:'Friday',SATURDAY:'Saturday',SUNDAY:'Sunday' };

const fmt12 = (t) => {
  if (!t) return '';
  const [h, m] = t.toString().split(':');
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const StarRow = ({ rating, size = 'sm', dark = false }) => {
  const val = parseFloat(rating) || 0;
  const cls = size === 'lg' ? 'w-5 h-5' : size === 'xl' ? 'w-6 h-6' : 'w-3.5 h-3.5';
  const empty = dark ? 'rgba(255,255,255,0.2)' : '#E5E7EB';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} className={cls} viewBox="0 0 20 20" fill={i <= Math.round(val) ? '#F59E0B' : empty}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const RatingBreakdown = ({ reviews }) => {
  const counts = [5,4,3,2,1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);
  const avg = reviews.length
    ? (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="flex flex-col sm:flex-row gap-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
      <div className="flex flex-col items-center justify-center sm:border-r sm:border-gray-200 sm:pr-8 flex-shrink-0">
        <span style={sg} className="text-5xl font-bold text-gray-900">{avg ?? '—'}</span>
        <StarRow rating={avg} size="lg" />
        <p className="text-sm text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex-1 space-y-2.5">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-4 text-right flex-shrink-0">{star}</span>
            <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className="text-sm text-gray-400 w-5 flex-shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TABS = ['About','Skills','Availability','Reviews','Resume'];

const fmtMonthYear = (val) => {
  if (!val) return '';
  // val could be 'YYYY-MM' from month input or 'YYYY-MM-DD' from backend
  const parts = val.toString().split('-');
  if (parts.length < 2) return val;
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const MentorProfilePage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('About');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const aboutRef      = useRef(null);
  const skillsRef     = useRef(null);
  const availabilityRef = useRef(null);
  const reviewsRef    = useRef(null);
  const resumeRef     = useRef(null);

  const sectionRefs = {
    About: aboutRef,
    Skills: skillsRef,
    Availability: availabilityRef,
    Reviews: reviewsRef,
    Resume: resumeRef,
  };

  const [userProfile, setUserProfile]     = useState(null);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [availability, setAvailability]   = useState([]);
  const [reviews, setReviews]             = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [education, setEducation]           = useState([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        const [up, mp, av, rv, we, ed] = await Promise.allSettled([
          getProfile(id), getMentorProfile(id), getMentorAvailability(id), getMentorReviews(id),
          getWorkExperience(id), getEducation(id),
        ]);
        if (up.status === 'fulfilled') setUserProfile(up.value);
        if (mp.status === 'fulfilled') setMentorProfile(mp.value);
        if (av.status === 'fulfilled') setAvailability(av.value || []);
        if (rv.status === 'fulfilled') setReviews(rv.value || []);
        if (we.status === 'fulfilled') setWorkExperience(we.value || []);
        if (ed.status === 'fulfilled') setEducation(ed.value || []);
        if (up.status === 'rejected' && mp.status === 'rejected') setError('Failed to load mentor profile.');
      } catch { setError('Failed to load mentor profile.'); }
      finally { setIsLoading(false); }
    };
    load();
  }, [id]);

  const scrollToSection = (tab) => {
    setActiveTab(tab);
    setTimeout(() => {
      sectionRefs[tab]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const name     = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ') || `Mentor #${id}`;
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const skills   = mentorProfile?.skills
    ? mentorProfile.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const rating     = parseFloat(mentorProfile?.averageRating) || 0;
  const isTopMentor = rating >= 4.5 && reviews.length >= 3;
  const sortedSlots = [...availability].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  );
  const slotsByDay = sortedSlots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: HERO_DARK }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-16 py-8 animate-pulse">
          <div className="h-4 w-48 bg-white/10 rounded mb-8" />
          <div className="flex gap-6">
            <div className="w-40 h-48 rounded-2xl bg-white/10 flex-shrink-0" />
            <div className="flex-1 space-y-4 pt-2">
              <div className="h-5 w-24 bg-white/10 rounded-full" />
              <div className="h-9 w-64 bg-white/10 rounded" />
              <div className="h-4 w-40 bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !userProfile && !mentorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <Link to="/mentors" className="text-xs text-indigo-600 hover:underline block">Browse all mentors</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ══════════════════════════════════════
          HERO — dark forest green, two rows
      ══════════════════════════════════════ */}
      <div style={{ background: HERO_DARK }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-16">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 py-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <Link to="/dashboard" className="hover:text-white transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/mentors" className="text-sm hover:text-white transition-colors">Find a Mentor</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-sm text-white font-medium">{name}</span>
          </div>

          {/* ── Upper row: avatar + identity ── */}
          <div className="flex flex-col sm:flex-row items-start gap-7 pb-8">

            {/* Avatar — large rectangle matching photo in the PDF */}
            <div
              className="w-36 sm:w-44 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(160deg, #4F46E5 0%, #7C3AED 50%, #0D3B2A 100%)', aspectRatio: '3/4' }}
            >
              {profile?.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span style={{ ...sg, fontSize: '3.5rem' }} className="text-white font-bold">{initials}</span>
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0 pt-1">

              {/* Top Mentor badge */}
              {isTopMentor && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3 text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.95)', color: HERO_DARK }}>
                  <svg className="w-4 h-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Top Mentor
                </div>
              )}

              {/* Name */}
              <h1 style={{ ...sg, color: '#fff', fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.1 }} className="mb-2">
                {name}
              </h1>

              {/* Role / tagline */}
              <p className="text-base font-medium mb-4" style={{ color: '#6EE7B7' }}>
                {mentorProfile?.yearsOfExperience > 0
                  ? `${mentorProfile.yearsOfExperience}+ Years of Industry Experience`
                  : 'Industry Expert & Mentor'}
              </p>

              {/* Company / location row */}
              <div className="flex flex-col gap-2 mt-1">
                {(() => {
                  const currentJob = workExperience.find(e => e.isCurrent) || workExperience[0];
                  return currentJob ? (
                    <>
                      <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: '#6EE7B7' }} />
                        <span className="text-sm font-medium">
                          {currentJob.jobTitle} · {currentJob.company}
                        </span>
                      </div>
                      {currentJob.location && (
                        <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                          <span className="text-sm">{currentJob.location}</span>
                        </div>
                      )}
                    </>
                  ) : null;
                })()}
                {(workExperience.length > 0 || education.length > 0) && (
                  <button
                    onClick={() => scrollToSection('Resume')}
                    className="mt-2 self-start inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-white/20"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    <FileText className="w-4 h-4" />
                    Resume
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Lower strip: stats + skills ── */}
        <div style={{ background: HERO_DARKER }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-16 py-6">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

              {/* Left — rating + stats */}
              <div className="space-y-3">
                {/* Rating badge */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-bold text-amber-400">
                      {rating > 0 ? rating.toFixed(1) : 'New'}
                    </span>
                  </div>
                  {reviews.length > 0 && (
                    <button
                      onClick={() => scrollToSection('Reviews')}
                      className="text-sm underline underline-offset-2 hover:opacity-80 transition-opacity"
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </button>
                  )}
                </div>

                {/* Stats list */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
                    <span className="text-sm">Remote / Online</span>
                  </div>
                  <div className="flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#6EE7B7' }} />
                    <span className="text-sm">Active this week</span>
                  </div>
                  <div className="flex items-center gap-2.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <MessageCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
                    <span className="text-sm">Usually responds within a day</span>
                  </div>
                </div>
              </div>

              {/* Right — skills */}
              {skills.length > 0 && (
                <div>
                  <p className="text-base font-bold text-white mb-3" style={sg}>Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 7).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 text-sm font-medium rounded-full"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.15)' }}
                      >
                        {skill}
                      </span>
                    ))}
                    {skills.length > 7 && (
                      <button
                        onClick={() => scrollToSection('Skills')}
                        className="px-3 py-1.5 text-sm font-medium rounded-full transition-all hover:bg-white/20"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        + {skills.length - 7} more
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          BODY — light theme, tabs + sidebar
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main content with sticky nav ── */}
          <div className="flex-1 min-w-0">

            {/* Sticky nav */}
            <div className="sticky top-16 z-20 bg-white rounded-t-2xl border border-gray-100 shadow-sm">
              <div className="flex">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => scrollToSection(tab)}
                    className={`flex-1 py-5 text-base font-semibold transition-colors relative ${
                      activeTab === tab ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                    {tab === 'Reviews' && reviews.length > 0 && (
                      <span className="ml-1.5 text-sm text-gray-400 hidden sm:inline">({reviews.length})</span>
                    )}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sections card */}
            <div className="bg-white rounded-b-2xl border border-gray-100 border-t-0">

              {/* About */}
              <div ref={aboutRef} className="p-8 sm:p-10 border-b border-gray-50">
                <h2 style={sg} className="text-xl font-bold text-gray-900 mb-4">About</h2>
                {userProfile?.bio ? (
                  <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{userProfile.bio}</p>
                ) : (
                  <p className="text-base text-gray-400 italic">
                    This mentor hasn't written a bio yet. Book a session to get to know them.
                  </p>
                )}
              </div>

              {/* Skills */}
              <div ref={skillsRef} className="p-8 sm:p-10 border-b border-gray-50">
                <h2 style={sg} className="text-xl font-bold text-gray-900 mb-5">Skills</h2>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {skills.map((skill) => (
                      <span key={skill} className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-gray-400 italic">No skills listed yet.</p>
                )}
                {(mentorProfile?.yearsOfExperience > 0 || mentorProfile?.totalSessions > 0 || reviews.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mt-8">
                    {mentorProfile?.yearsOfExperience > 0 && (
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <p style={sg} className="text-3xl font-bold text-gray-900">{mentorProfile.yearsOfExperience}</p>
                        <p className="text-sm text-gray-500 mt-1">Years of experience</p>
                      </div>
                    )}
                    {mentorProfile?.totalSessions > 0 && (
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <p style={sg} className="text-3xl font-bold text-gray-900">{mentorProfile.totalSessions}</p>
                        <p className="text-sm text-gray-500 mt-1">Sessions completed</p>
                      </div>
                    )}
                    {reviews.length > 0 && (
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <p style={sg} className="text-3xl font-bold text-gray-900">{reviews.length}</p>
                        <p className="text-sm text-gray-500 mt-1">Student reviews</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Availability */}
              <div ref={availabilityRef} className="p-8 sm:p-10 border-b border-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <h2 style={sg} className="text-xl font-bold text-gray-900">Availability</h2>
                  <span className="text-sm text-gray-400 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
                    Local timezone
                  </span>
                </div>
                {Object.keys(slotsByDay).length > 0 ? (
                  <div className="space-y-3">
                    {DAY_ORDER.filter((d) => slotsByDay[d]).map((day) => (
                      <div key={day} className="rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                          <span className="text-base font-semibold text-gray-700">{DAYS_FULL[day]}</span>
                        </div>
                        <div className="px-5 py-4 flex flex-wrap gap-2">
                          {slotsByDay[day].map((slot) => (
                            <span key={slot.id} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                              {fmt12(slot.startTime)} – {fmt12(slot.endTime)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-gray-400 italic text-center py-10">No availability set yet. Contact the mentor to arrange a time.</p>
                )}
              </div>

              {/* Reviews */}
              <div ref={reviewsRef} className="p-8 sm:p-10 border-b border-gray-50">
                <h2 style={sg} className="text-xl font-bold text-gray-900 mb-6">Reviews</h2>
                {reviews.length > 0 ? (
                  <>
                    <RatingBreakdown reviews={reviews} />
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-6 rounded-2xl border border-gray-100 bg-white">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                              S
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-semibold text-gray-800">Student</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <StarRow rating={review.rating} size="sm" />
                                <span className="text-sm text-gray-400">
                                  {review.createdAt && new Date(review.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {review.feedback && (
                            <p className="text-base text-gray-600 leading-relaxed">{review.feedback}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                      <Star className="w-7 h-7 text-amber-300" />
                    </div>
                    <p className="text-base font-medium text-gray-600">No reviews yet</p>
                    <p className="text-base text-gray-400 mt-1">Be the first to book a session and leave a review.</p>
                  </div>
                )}
              </div>

              {/* Resume */}
              <div ref={resumeRef} className="p-8 sm:p-10">
                <h2 style={sg} className="text-xl font-bold text-gray-900 mb-8">Resume</h2>

                {/* Work Experience */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-indigo-500" />
                    </div>
                    <h3 style={sg} className="text-base font-bold text-gray-800">Work Experience</h3>
                  </div>
                  {workExperience.length > 0 ? (
                    <div className="relative pl-7">
                      <div className="absolute left-0 top-2 bottom-2 w-px bg-gray-100" />
                      <div className="space-y-6">
                        {workExperience.map((entry, idx) => (
                          <div key={entry.id || idx} className="relative">
                            <div className="absolute -left-7 top-2 w-3 h-3 rounded-full bg-indigo-200 border-2 border-white ring-1 ring-indigo-200" />
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                  <Briefcase className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p style={sg} className="text-base font-bold text-gray-900">{entry.jobTitle}</p>
                                  <p className="text-base text-gray-600 mt-0.5">{entry.company}</p>
                                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                                    {(entry.startDate || entry.isCurrent) && (
                                      <span className="text-sm text-gray-400">
                                        {fmtMonthYear(entry.startDate)}{' – '}{entry.isCurrent ? 'Present' : fmtMonthYear(entry.endDate)}
                                      </span>
                                    )}
                                    {entry.location && (
                                      <><span className="text-sm text-gray-300">·</span><span className="text-sm text-gray-400">{entry.location}</span></>
                                    )}
                                  </div>
                                  {entry.description && (
                                    <p className="text-base text-gray-500 mt-3 leading-relaxed whitespace-pre-wrap">{entry.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-base text-gray-400 italic">No work experience listed.</p>
                  )}
                </div>

                <div className="h-px bg-gray-100 mb-10" />

                {/* Education */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-indigo-500" />
                    </div>
                    <h3 style={sg} className="text-base font-bold text-gray-800">Education</h3>
                  </div>
                  {education.length > 0 ? (
                    <div className="relative pl-7">
                      <div className="absolute left-0 top-2 bottom-2 w-px bg-gray-100" />
                      <div className="space-y-6">
                        {education.map((entry, idx) => (
                          <div key={entry.id || idx} className="relative">
                            <div className="absolute -left-7 top-2 w-3 h-3 rounded-full bg-indigo-200 border-2 border-white ring-1 ring-indigo-200" />
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                  <GraduationCap className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p style={sg} className="text-base font-bold text-gray-900">{entry.school}</p>
                                  {(entry.degree || entry.fieldOfStudy) && (
                                    <p className="text-base text-gray-600 mt-0.5">
                                      {[entry.degree, entry.fieldOfStudy].filter(Boolean).join(' · ')}
                                    </p>
                                  )}
                                  {(entry.startYear || entry.endYear) && (
                                    <p className="text-sm text-gray-400 mt-1.5">
                                      {entry.startYear || ''}{entry.endYear ? ` – ${entry.endYear}` : ''}
                                    </p>
                                  )}
                                  {entry.description && (
                                    <p className="text-base text-gray-500 mt-3 leading-relaxed whitespace-pre-wrap">{entry.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-base text-gray-400 italic">No education listed.</p>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ── Sticky sidebar ── */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-5">

              {/* Booking card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 pt-6 pb-5 border-b border-gray-50">
                  <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">Book a session</p>
                  {mentorProfile?.hourlyRate && (
                    <div className="flex items-baseline gap-1">
                      <span style={sg} className="text-5xl font-bold text-gray-900">LKR {mentorProfile.hourlyRate}</span>
                      <span className="text-base text-gray-400">/ hour</span>
                    </div>
                  )}
                </div>
                <div className="px-6 py-5 space-y-4 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-gray-500">Rating</span>
                    <div className="flex items-center gap-2">
                      <StarRow rating={rating} size="sm" />
                      <span className="text-base font-semibold text-gray-700">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
                    </div>
                  </div>
                  {mentorProfile?.yearsOfExperience > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-base text-gray-500">Experience</span>
                      <span className="text-base font-semibold text-gray-700">{mentorProfile.yearsOfExperience} years</span>
                    </div>
                  )}
                  {mentorProfile?.totalSessions > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-base text-gray-500">Sessions done</span>
                      <span className="text-base font-semibold text-gray-700">{mentorProfile.totalSessions}</span>
                    </div>
                  )}
                  {reviews.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-base text-gray-500">Reviews</span>
                      <span className="text-base font-semibold text-gray-700">{reviews.length}</span>
                    </div>
                  )}
                </div>
                <div className="px-6 py-5">
                  <BookingModal mentorId={id} mentorName={name} hourlyRate={mentorProfile?.hourlyRate} />
                </div>
              </div>

              {/* Availability quick-view */}
              {sortedSlots.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold tracking-widest uppercase text-gray-400">Availability</p>
                    <button onClick={() => scrollToSection('Availability')} className="text-sm text-indigo-500 hover:text-indigo-700 transition-colors font-medium">
                      See all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {sortedSlots.slice(0, 4).map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span className="text-base font-medium text-gray-600">{DAYS_FULL[slot.dayOfWeek]?.slice(0, 3)}</span>
                        </div>
                        <span className="text-base text-gray-400">{fmt12(slot.startTime)}</span>
                      </div>
                    ))}
                    {sortedSlots.length > 4 && (
                      <p className="text-sm text-gray-400 pt-1">+{sortedSlots.length - 4} more slots</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-indigo-100 bg-indigo-50">
                <MessageCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <p className="text-sm text-indigo-600">Leave a note for the mentor when you book.</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfilePage;
