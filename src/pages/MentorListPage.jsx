import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getMentors } from '@/api/userApi';
import { Search, Star, Clock, ChevronRight, SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';

const sg = { fontFamily: "'Space Grotesk', sans-serif" };

const GRADIENTS = [
  'linear-gradient(135deg,#4F46E5,#7C3AED)',
  'linear-gradient(135deg,#0EA5E9,#2563EB)',
  'linear-gradient(135deg,#10B981,#0D9488)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#EC4899,#8B5CF6)',
];
const getGrad = (id) => GRADIENTS[(id || 0) % GRADIENTS.length];

const StarRow = ({ rating }) => {
  const val = parseFloat(rating) || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20"
          fill={i <= Math.round(val) ? '#F59E0B' : '#E5E7EB'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{val > 0 ? val.toFixed(1) : 'New'}</span>
    </div>
  );
};

/* ── Horizontal mentor card ── */
const MentorCard = ({ mentor }) => {
  const name     = [mentor.firstName, mentor.lastName].filter(Boolean).join(' ') || `Mentor #${mentor.userId}`;
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const skills   = mentor.skills ? mentor.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  const rating   = parseFloat(mentor.averageRating) || 0;
  const exp      = mentor.yearsOfExperience;

  return (
    <Link to={`/mentors/${mentor.userId}`} className="block group">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/60 transition-all duration-200">

        {/* Photo / Avatar */}
        <div className="w-44 flex-shrink-0 relative overflow-hidden bg-gray-100">
          {mentor.profilePictureUrl ? (
            <img
              src={mentor.profilePictureUrl}
              alt={name}
              className="w-full h-full object-cover"
              style={{ minHeight: '180px' }}
            />
          ) : (
            <div
              className="w-full flex items-center justify-center text-white font-bold text-3xl"
              style={{ background: getGrad(mentor.userId), minHeight: '180px' }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-5 flex flex-col justify-between min-w-0">
          <div>
            {/* Name + exp */}
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <h3 style={sg} className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                  {name}
                </h3>
                {exp > 0 && (
                  <p className="text-sm text-indigo-500 font-medium mt-0.5">
                    {exp}+ Years of Industry Experience
                  </p>
                )}
              </div>
              <StarRow rating={rating} />
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mt-2 mb-3">
              {mentor.bio || 'Experienced professional ready to help you grow your career.'}
            </p>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {skills.slice(0, 5).map(skill => (
                  <span key={skill} className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                    {skill}
                  </span>
                ))}
                {skills.length > 5 && (
                  <span className="px-2.5 py-1 text-xs font-medium text-gray-400 bg-gray-50 rounded-full">
                    +{skills.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-400">Starting from</p>
              <p style={sg} className="text-lg font-bold text-gray-900">
                LKR {mentor.hourlyRate}<span className="text-sm font-normal text-gray-400">/hr</span>
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl group-hover:shadow-md group-hover:shadow-indigo-200 transition-all"
              style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}
            >
              View Profile <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex animate-pulse" style={{ minHeight: '180px' }}>
    <div className="w-44 flex-shrink-0 bg-gray-100" />
    <div className="flex-1 px-6 py-5 space-y-3">
      <div className="h-5 bg-gray-100 rounded w-1/2" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
      <div className="flex gap-2">
        {[1,2,3].map(i => <div key={i} className="h-6 w-16 bg-gray-100 rounded-full" />)}
      </div>
    </div>
  </div>
);

/* ── Filter panel section ── */
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span style={sg} className="text-sm font-bold text-gray-800">{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />}
      </button>
      {open && children}
    </div>
  );
};

/* ── Main page ── */
const MentorListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allMentors, setAllMentors]     = useState([]);
  const [searchSkill, setSearchSkill]   = useState(searchParams.get('skill') || '');
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState(null);
  const [filtersOpen, setFiltersOpen]   = useState(false);

  // Filter state
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [expFilter, setExpFilter]           = useState('any');
  const [minRate, setMinRate]               = useState('');
  const [maxRate, setMaxRate]               = useState('');
  const [topRated, setTopRated]             = useState(false);
  const [newOnly, setNewOnly]               = useState(false);
  const [showMoreSkills, setShowMoreSkills] = useState(false);

  const fetchMentors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMentors('');
      setAllMentors(data || []);
    } catch {
      setError('Failed to load mentors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const skill = searchParams.get('skill') || '';
    setSearchSkill(skill);
    fetchMentors();
    setSelectedSkills(new Set());
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchSkill.trim() ? { skill: searchSkill.trim() } : {});
  };

  // Keep the search input in sync with the URL param (e.g. when a category tab is clicked)
  useEffect(() => {
    setSearchSkill(searchParams.get('skill') || '');
  }, [searchParams]);

  const clearAll = () => {
    setSelectedSkills(new Set());
    setExpFilter('any');
    setMinRate('');
    setMaxRate('');
    setTopRated(false);
    setNewOnly(false);
    setSearchParams({});
  };

  // Build skill counts from all mentors
  const skillCounts = useMemo(() => {
    const map = {};
    allMentors.forEach(m => {
      if (!m.skills) return;
      m.skills.split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
        map[s] = (map[s] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allMentors]);

  const visibleSkills = showMoreSkills ? skillCounts : skillCounts.slice(0, 6);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      return next;
    });
  };

  // Apply all filters
  const filteredMentors = useMemo(() => {
    const urlSkill = (searchParams.get('skill') || '').toLowerCase().trim();

    return allMentors.filter(m => {
      const skillsStr = (m.skills || '').toLowerCase();
      const skills    = skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(Boolean) : [];

      // URL skill param (category nav or search bar) — substring match so
      // broad labels like "Data Science" match mentors tagged "Data Science, Python"
      if (urlSkill && !skillsStr.includes(urlSkill)) return false;

      // Sidebar skill checkboxes — exact (case-insensitive) match
      if (selectedSkills.size > 0) {
        const hasSkill = [...selectedSkills].some(s => skills.includes(s.toLowerCase()));
        if (!hasSkill) return false;
      }

      if (expFilter !== 'any') {
        const exp = m.yearsOfExperience || 0;
        if (expFilter === '0-2'  && !(exp >= 0 && exp <= 2))  return false;
        if (expFilter === '3-6'  && !(exp >= 3 && exp <= 6))  return false;
        if (expFilter === '7+'   && !(exp >= 7))               return false;
      }

      if (minRate && m.hourlyRate < parseFloat(minRate)) return false;
      if (maxRate && m.hourlyRate > parseFloat(maxRate)) return false;

      if (topRated && (parseFloat(m.averageRating) || 0) < 4.5) return false;
      if (newOnly  && (parseFloat(m.averageRating) || 0) > 0)   return false;

      return true;
    });
  }, [allMentors, selectedSkills, expFilter, minRate, maxRate, topRated, newOnly, searchParams]);

  const activeFilterCount =
    selectedSkills.size +
    (expFilter !== 'any' ? 1 : 0) +
    (minRate || maxRate ? 1 : 0) +
    (topRated ? 1 : 0) +
    (newOnly  ? 1 : 0) +
    (searchParams.get('skill') ? 1 : 0);

  const activeSkill = searchParams.get('skill');

  const FilterPanel = () => (
    <div className="space-y-0">

      {/* Skills */}
      <FilterSection title="Skills">
        <div className="space-y-2">
          {visibleSkills.map(([skill, count]) => (
            <label key={skill} className="flex items-center justify-between gap-2 cursor-pointer group">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSkills.has(skill)}
                  onChange={() => toggleSkill(skill)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{skill}</span>
              </div>
              <span className="text-xs text-gray-400">{count}</span>
            </label>
          ))}
        </div>
        {skillCounts.length > 6 && (
          <button
            onClick={() => setShowMoreSkills(s => !s)}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 mt-2 transition-colors"
          >
            {showMoreSkills ? 'Show less' : `Show ${skillCounts.length - 6} more`}
          </button>
        )}
      </FilterSection>

      {/* Experience */}
      <FilterSection title="Experience Level">
        <div className="space-y-2">
          {[
            { value: 'any', label: 'Any experience' },
            { value: '0-2', label: '0 – 2 years' },
            { value: '3-6', label: '3 – 6 years' },
            { value: '7+',  label: '7+ years' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="exp"
                value={opt.value}
                checked={expFilter === opt.value}
                onChange={() => setExpFilter(opt.value)}
                className="w-4 h-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range (LKR/hr)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minRate}
            onChange={e => setMinRate(e.target.value)}
            placeholder="Min"
            min="0"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
          <span className="text-gray-400 text-xs flex-shrink-0">–</span>
          <input
            type="number"
            value={maxRate}
            onChange={e => setMaxRate(e.target.value)}
            placeholder="Max"
            min="0"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
      </FilterSection>

      {/* Quick filters */}
      <FilterSection title="Quick Filters" defaultOpen={true}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={topRated} onChange={e => setTopRated(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Top rated (4.5+)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={newOnly} onChange={e => setNewOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">New mentors</span>
          </label>
        </div>
      </FilterSection>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full py-2 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header + search */}
        <div className="mb-8">
          <h1 style={sg} className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-1">
            Find your mentor
          </h1>
          <p className="text-gray-400 text-base mb-5">
            Connect with industry experts and accelerate your career.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchSkill}
                onChange={e => setSearchSkill(e.target.value)}
                placeholder="Search by skill — React, Python, Leadership..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold text-white rounded-xl flex-shrink-0 hover:shadow-md hover:shadow-indigo-200 transition-all"
              style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex gap-7">

          {/* ── Left filter panel (desktop) ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                  <span style={sg} className="text-sm font-bold text-gray-900">Filters</span>
                </div>
                {activeFilterCount > 0 && (
                  <span className="text-xs font-bold text-white bg-indigo-500 rounded-full px-2 py-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Results bar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {!isLoading && (
                  <span className="text-sm text-gray-500">
                    <span style={sg} className="font-bold text-gray-900">{filteredMentors.length}</span> mentor{filteredMentors.length !== 1 ? 's' : ''} found
                    {activeSkill && <span> for <span className="text-indigo-600 font-semibold">"{activeSkill}"</span></span>}
                  </span>
                )}
                {activeSkill && (
                  <button onClick={() => { setSearchSkill(''); setSearchParams({}); }}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full transition-colors">
                    <X className="w-3 h-3" /> Clear search
                  </button>
                )}
                {/* Active skill filter chips */}
                {[...selectedSkills].map(s => (
                  <button key={s} onClick={() => toggleSkill(s)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-100 transition-colors">
                    {s} <X className="w-3 h-3" />
                  </button>
                ))}
              </div>

              {/* Mobile filter button */}
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="text-xs font-bold text-white bg-indigo-500 rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mentor list */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-red-100">
                <p className="text-sm text-red-500 mb-2">{error}</p>
                <button onClick={() => fetchMentors(activeSkill || '')} className="text-xs text-indigo-600 hover:underline">
                  Try again
                </button>
              </div>
            ) : filteredMentors.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-indigo-300" />
                </div>
                <p style={sg} className="text-base font-semibold text-gray-700 mb-1">No mentors match your filters</p>
                <p className="text-sm text-gray-400 mb-4">Try adjusting or clearing your filters.</p>
                <button onClick={clearAll} className="text-sm font-semibold text-indigo-600 hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMentors.map(mentor => (
                  <MentorCard key={mentor.userId} mentor={mentor} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="ml-auto w-80 bg-white h-full overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <span style={sg} className="text-base font-bold text-gray-900">Filters</span>
              <button onClick={() => setFiltersOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorListPage;
