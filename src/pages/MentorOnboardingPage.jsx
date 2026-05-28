import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  createProfile,
  createMentorProfile,
  addAvailabilitySlot,
  addWorkExperience,
  addEducation,
} from '@/api/userApi';
import { Zap, X, Plus, ChevronRight, ChevronLeft, Check, Loader2, Briefcase, GraduationCap } from 'lucide-react';

const sg = { fontFamily: "'Space Grotesk', sans-serif" };

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAYS_LABEL = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
};

const STEPS = [
  { number: 1, label: 'Basic Info' },
  { number: 2, label: 'Expertise' },
  { number: 3, label: 'Availability' },
  { number: 4, label: 'Resume' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - i);

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center mb-10">
    {STEPS.map((step, idx) => {
      const done = current > step.number;
      const active = current === step.number;
      return (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                done
                  ? 'bg-indigo-600 text-white'
                  : active
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {done ? <Check className="w-4 h-4" /> : step.number}
            </div>
            <span className={`mt-1.5 text-xs font-medium ${active ? 'text-indigo-600' : done ? 'text-gray-500' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`h-0.5 w-12 sm:w-16 mx-2 mb-5 transition-colors duration-200 ${done ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          )}
        </div>
      );
    })}
  </div>
);

const emptyWorkEntry = () => ({
  jobTitle: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '',
});

const emptyEduEntry = () => ({
  school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', description: '',
});

const MentorOnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Step 1 state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');

  // Step 2 state
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');

  // Step 3 state
  const [slots, setSlots] = useState([]);
  const [slotDay, setSlotDay] = useState('MONDAY');
  const [slotStart, setSlotStart] = useState('');
  const [slotEnd, setSlotEnd] = useState('');
  const [slotError, setSlotError] = useState('');

  // Step 4 state — Resume
  const [workEntries, setWorkEntries] = useState([]);
  const [workForm, setWorkForm] = useState(emptyWorkEntry());
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [workFormError, setWorkFormError] = useState('');

  const [eduEntries, setEduEntries] = useState([]);
  const [eduForm, setEduForm] = useState(emptyEduEntry());
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduFormError, setEduFormError] = useState('');

  // Skills helpers
  const addSkill = (raw) => {
    const trimmed = raw.trim().replace(/,+$/, '').trim();
    if (trimmed && !skills.includes(trimmed)) setSkills((prev) => [...prev, trimmed]);
    setSkillInput('');
  };
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); }
  };
  const removeSkill = (skill) => setSkills((prev) => prev.filter((s) => s !== skill));

  // Availability helpers
  const addSlot = () => {
    setSlotError('');
    if (!slotStart || !slotEnd) { setSlotError('Please set both start and end time.'); return; }
    if (slotStart >= slotEnd) { setSlotError('End time must be after start time.'); return; }
    if (slots.find((s) => s.dayOfWeek === slotDay && s.startTime === slotStart)) {
      setSlotError('That slot already exists.'); return;
    }
    setSlots((prev) => [...prev, { dayOfWeek: slotDay, startTime: slotStart, endTime: slotEnd }]);
    setSlotStart(''); setSlotEnd('');
  };
  const removeSlot = (idx) => setSlots((prev) => prev.filter((_, i) => i !== idx));

  // Work experience helpers
  const saveWorkEntry = () => {
    setWorkFormError('');
    if (!workForm.jobTitle.trim()) { setWorkFormError('Job title is required.'); return; }
    if (!workForm.company.trim()) { setWorkFormError('Company is required.'); return; }
    setWorkEntries((prev) => [...prev, { ...workForm }]);
    setWorkForm(emptyWorkEntry());
    setShowWorkForm(false);
  };
  const removeWorkEntry = (idx) => setWorkEntries((prev) => prev.filter((_, i) => i !== idx));

  // Education helpers
  const saveEduEntry = () => {
    setEduFormError('');
    if (!eduForm.school.trim()) { setEduFormError('School is required.'); return; }
    setEduEntries((prev) => [...prev, { ...eduForm }]);
    setEduForm(emptyEduEntry());
    setShowEduForm(false);
  };
  const removeEduEntry = (idx) => setEduEntries((prev) => prev.filter((_, i) => i !== idx));

  // Step validation
  const validateStep1 = () => {
    if (!firstName.trim()) { setError('First name is required.'); return false; }
    if (!lastName.trim()) { setError('Last name is required.'); return false; }
    return true;
  };
  const validateStep2 = () => {
    if (skillInput.trim()) addSkill(skillInput);
    if (skills.length === 0) { setError('Add at least one skill.'); return false; }
    if (!hourlyRate || parseFloat(hourlyRate) <= 0) { setError('Enter a valid hourly rate.'); return false; }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };
  const handleBack = () => { setError(null); setStep((s) => s - 1); };

  const handleFinish = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await createProfile(user.userId, { firstName: firstName.trim(), lastName: lastName.trim(), bio: bio.trim() }, 'MENTOR');

      await createMentorProfile(user.userId, {
        skills: skills.join(', '),
        hourlyRate: parseFloat(hourlyRate),
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
      });

      for (const slot of slots) {
        await addAvailabilitySlot(user.userId, {
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime + ':00',
          endTime: slot.endTime + ':00',
        });
      }

      // Resume entries are optional — save best-effort, never block navigation
      try {
        for (const entry of workEntries) {
          await addWorkExperience(user.userId, {
            jobTitle: entry.jobTitle,
            company: entry.company,
            location: entry.location || null,
            startDate: entry.startDate || null,
            endDate: entry.isCurrent ? null : (entry.endDate || null),
            isCurrent: entry.isCurrent,
            description: entry.description || null,
          });
        }
      } catch (_) {}

      try {
        for (const entry of eduEntries) {
          await addEducation(user.userId, {
            school: entry.school,
            degree: entry.degree || null,
            fieldOfStudy: entry.fieldOfStudy || null,
            startYear: entry.startYear ? parseInt(entry.startYear) : null,
            endYear: entry.endYear ? parseInt(entry.endYear) : null,
            description: entry.description || null,
          });
        }
      } catch (_) {}

      navigate('/mentor-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors';
  const selectClass = 'w-full px-3 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors';
  const labelClass = 'block text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span style={sg} className="font-bold text-gray-900 text-lg tracking-tight">SkillBridge</span>
        <span className="ml-2 text-xs font-semibold tracking-widest uppercase text-gray-400">Mentor Setup</span>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-500 mb-1">
              Step {step} of 4
            </p>
            <h1 style={sg} className="text-2xl font-bold text-gray-900">
              {step === 1 && 'Tell students about yourself'}
              {step === 2 && 'Your skills and expertise'}
              {step === 3 && 'Set your availability'}
              {step === 4 && 'Build your resume'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {step === 1 && 'Your name and bio are the first things students see on your profile.'}
              {step === 2 && 'Help students find you by listing what you teach and your rate.'}
              {step === 3 && 'Let students know when you are free. You can always update this later.'}
              {step === 4 && 'Add your work experience and education. You can skip this and fill it in later.'}
            </p>
          </div>

          <StepIndicator current={step} />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name <span className="text-red-400">*</span></label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Akil" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name <span className="text-red-400">*</span></label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dikshan" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell students about your background, what you specialise in, and how you can help them..."
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{bio.length} / 500</p>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Skills <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    onBlur={() => skillInput.trim() && addSkill(skillInput)}
                    placeholder="e.g. React — press Enter or comma to add"
                    className={inputClass}
                  />
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-indigo-900 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Hourly Rate (LKR) <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">LKR</span>
                      <input type="number" min="1" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="5000"
                        className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Years of Experience</label>
                    <input type="number" min="0" max="50" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} placeholder="5" className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Day</label>
                    <select value={slotDay} onChange={(e) => setSlotDay(e.target.value)} className={selectClass}>
                      {DAYS.map((d) => <option key={d} value={d}>{DAYS_LABEL[d]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Start</label>
                    <input type="time" value={slotStart} onChange={(e) => setSlotStart(e.target.value)} className={selectClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End</label>
                    <input type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} className={selectClass} />
                  </div>
                </div>
                {slotError && <p className="text-xs text-red-500">{slotError}</p>}
                <button type="button" onClick={addSlot} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                  <Plus className="w-4 h-4" /> Add slot
                </button>
                {slots.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">Added slots</p>
                    {slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-sm font-medium text-gray-700">{DAYS_LABEL[slot.dayOfWeek]}</span>
                          <span className="text-sm text-gray-400">{slot.startTime} – {slot.endTime}</span>
                        </div>
                        <button type="button" onClick={() => removeSlot(idx)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No slots added yet. You can add availability later from your dashboard.</p>
                )}
              </div>
            )}

            {/* Step 4 — Resume */}
            {step === 4 && (
              <div className="space-y-8">

                {/* Work Experience */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-500" />
                      <span style={sg} className="text-sm font-bold text-gray-800">Work Experience</span>
                    </div>
                    {!showWorkForm && (
                      <button
                        type="button"
                        onClick={() => setShowWorkForm(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>

                  {workEntries.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {workEntries.map((entry, idx) => (
                        <div key={idx} className="flex items-start justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{entry.jobTitle}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {entry.company}{entry.location ? ` · ${entry.location}` : ''}
                            </p>
                            {(entry.startDate || entry.isCurrent) && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {entry.startDate || ''}{entry.isCurrent ? ' – Present' : entry.endDate ? ` – ${entry.endDate}` : ''}
                              </p>
                            )}
                          </div>
                          <button type="button" onClick={() => removeWorkEntry(idx)} className="text-gray-300 hover:text-red-400 transition-colors ml-4 flex-shrink-0 mt-0.5">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showWorkForm && (
                    <div className="border border-indigo-100 rounded-xl p-5 bg-indigo-50/30 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Job Title <span className="text-red-400">*</span></label>
                          <input type="text" value={workForm.jobTitle} onChange={(e) => setWorkForm({ ...workForm, jobTitle: e.target.value })} placeholder="Software Engineer" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Company <span className="text-red-400">*</span></label>
                          <input type="text" value={workForm.company} onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })} placeholder="Acme Inc." className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Location</label>
                        <input type="text" value={workForm.location} onChange={(e) => setWorkForm({ ...workForm, location: e.target.value })} placeholder="London, UK (or Remote)" className={inputClass} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Start Date</label>
                          <input type="month" value={workForm.startDate} onChange={(e) => setWorkForm({ ...workForm, startDate: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>End Date</label>
                          <input type="month" value={workForm.endDate} onChange={(e) => setWorkForm({ ...workForm, endDate: e.target.value })} disabled={workForm.isCurrent}
                            className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`} />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={workForm.isCurrent}
                          onChange={(e) => setWorkForm({ ...workForm, isCurrent: e.target.checked, endDate: '' })}
                          className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-600">I currently work here</span>
                      </label>
                      <div>
                        <label className={labelClass}>Description</label>
                        <textarea value={workForm.description} onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                          placeholder="Describe your responsibilities and achievements..." rows={3} className={`${inputClass} resize-none`} />
                      </div>
                      {workFormError && <p className="text-xs text-red-500">{workFormError}</p>}
                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={saveWorkEntry}
                          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                          Save
                        </button>
                        <button type="button" onClick={() => { setShowWorkForm(false); setWorkForm(emptyWorkEntry()); setWorkFormError(''); }}
                          className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {workEntries.length === 0 && !showWorkForm && (
                    <p className="text-xs text-gray-400 italic">No work experience added yet.</p>
                  )}
                </div>

                <div className="h-px bg-gray-100" />

                {/* Education */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-500" />
                      <span style={sg} className="text-sm font-bold text-gray-800">Education</span>
                    </div>
                    {!showEduForm && (
                      <button
                        type="button"
                        onClick={() => setShowEduForm(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>

                  {eduEntries.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {eduEntries.map((entry, idx) => (
                        <div key={idx} className="flex items-start justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{entry.school}</p>
                            {entry.degree && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {entry.degree}{entry.fieldOfStudy ? ` · ${entry.fieldOfStudy}` : ''}
                              </p>
                            )}
                            {(entry.startYear || entry.endYear) && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {entry.startYear || ''}{entry.endYear ? ` – ${entry.endYear}` : ''}
                              </p>
                            )}
                          </div>
                          <button type="button" onClick={() => removeEduEntry(idx)} className="text-gray-300 hover:text-red-400 transition-colors ml-4 flex-shrink-0 mt-0.5">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showEduForm && (
                    <div className="border border-indigo-100 rounded-xl p-5 bg-indigo-50/30 space-y-4">
                      <div>
                        <label className={labelClass}>School <span className="text-red-400">*</span></label>
                        <input type="text" value={eduForm.school} onChange={(e) => setEduForm({ ...eduForm, school: e.target.value })} placeholder="University of London" className={inputClass} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Degree</label>
                          <input type="text" value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} placeholder="Bachelor's" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Field of Study</label>
                          <input type="text" value={eduForm.fieldOfStudy} onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })} placeholder="Computer Science" className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Start Year</label>
                          <select value={eduForm.startYear} onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })} className={selectClass}>
                            <option value="">Select year</option>
                            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>End Year</label>
                          <select value={eduForm.endYear} onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })} className={selectClass}>
                            <option value="">Select year</option>
                            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Description</label>
                        <textarea value={eduForm.description} onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })}
                          placeholder="Activities, thesis, achievements..." rows={2} className={`${inputClass} resize-none`} />
                      </div>
                      {eduFormError && <p className="text-xs text-red-500">{eduFormError}</p>}
                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={saveEduEntry}
                          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                          Save
                        </button>
                        <button type="button" onClick={() => { setShowEduForm(false); setEduForm(emptyEduEntry()); setEduFormError(''); }}
                          className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {eduEntries.length === 0 && !showEduForm && (
                    <p className="text-xs text-gray-400 italic">No education added yet.</p>
                  )}
                </div>

              </div>
            )}

            {error && (
              <div className="mt-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button type="button" onClick={handleBack} disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button type="button" onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-md hover:shadow-indigo-200"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={handleFinish} disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-md hover:shadow-indigo-200 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Finish setup</>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MentorOnboardingPage;
