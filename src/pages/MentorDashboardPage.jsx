import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getMentorBookings, acceptBooking, rejectBooking, completeSession } from '@/api/bookingApi';
import {
  getProfile, getMentorProfile, getMentorAvailability,
  updateProfile, updateMentorProfile,
  addAvailabilitySlot, deleteAvailability,
} from '@/api/userApi';
import {
  Clock, Check, X, CheckCircle2, Camera, Edit2,
  Plus, Trash2, Star, ExternalLink, Calendar,
  TrendingUp, Users, Zap, ChevronRight, Copy, CheckCheck,
  DollarSign, BarChart2, ArrowUpRight,
} from 'lucide-react';

const sg = { fontFamily: "'Space Grotesk', sans-serif" };

const STATUS_CONFIG = {
  PENDING:   { label: 'New Request', color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmed',   color: '#059669', bg: '#D1FAE5' },
  COMPLETED: { label: 'Completed',   color: '#6B7280', bg: '#F3F4F6' },
  CANCELLED: { label: 'Cancelled',   color: '#EF4444', bg: '#FEE2E2' },
};
const ACCENT = { PENDING: '#F59E0B', CONFIRMED: '#10B981', COMPLETED: '#9CA3AF', CANCELLED: '#F87171' };

const DAY_ORDER  = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const DAY_LABELS = { MONDAY:'Mon',TUESDAY:'Tue',WEDNESDAY:'Wed',THURSDAY:'Thu',FRIDAY:'Fri',SATURDAY:'Sat',SUNDAY:'Sun' };

const GRADIENTS = [
  'linear-gradient(135deg,#4F46E5,#7C3AED)',
  'linear-gradient(135deg,#0EA5E9,#2563EB)',
  'linear-gradient(135deg,#10B981,#0D9488)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
];
const getGrad = (id) => GRADIENTS[(id || 0) % GRADIENTS.length];

const fmt12 = (t) => {
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

const resizeToBase64 = (file, maxPx = 400) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const c = document.createElement('canvas');
        c.width  = Math.round(img.width  * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = rej;
      img.src = e.target.result;
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

/* ─── Edit Profile Drawer ─── */
const EditProfileDrawer = ({ open, onClose, userId, userProfile, mentorProfile, availability, onSaved }) => {
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', bio: '',
    photoUrl: '', skillsText: '', hourlyRate: '', yearsOfExperience: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');
  const [slots, setSlots]       = useState([]);
  const [newSlot, setNewSlot]   = useState({ dayOfWeek: 'MONDAY', startTime: '', endTime: '' });
  const [slotErr, setSlotErr]   = useState('');
  const [addingSlot, setAdding] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      firstName:         userProfile?.firstName           || '',
      lastName:          userProfile?.lastName            || '',
      bio:               userProfile?.bio                 || '',
      photoUrl:          userProfile?.profilePictureUrl   || '',
      skillsText:        mentorProfile?.skills            || '',
      hourlyRate:        mentorProfile?.hourlyRate        != null ? String(mentorProfile.hourlyRate) : '',
      yearsOfExperience: mentorProfile?.yearsOfExperience != null ? String(mentorProfile.yearsOfExperience) : '',
    });
    setPhotoPreview(userProfile?.profilePictureUrl || null);
    setSlots(availability || []);
    setSaveError('');
  }, [open, userProfile, mentorProfile, availability]);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const b64 = await resizeToBase64(file);
      setPhotoPreview(b64);
      setForm(f => ({ ...f, photoUrl: b64 }));
    } catch { alert('Could not process image.'); }
  };

  const handleSave = async () => {
    setSaving(true); setSaveError('');
    try {
      await updateProfile(userId, {
        firstName: form.firstName || undefined,
        lastName:  form.lastName  || undefined,
        bio:       form.bio       || undefined,
        profilePictureUrl: form.photoUrl || undefined,
      });
      await updateMentorProfile(userId, {
        skills:            form.skillsText       || undefined,
        hourlyRate:        form.hourlyRate        ? parseFloat(form.hourlyRate)        : undefined,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience)   : undefined,
      });
      onSaved(); onClose();
    } catch { setSaveError('Failed to save. Please try again.'); }
    finally  { setSaving(false); }
  };

  const handleAddSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime) { setSlotErr('Set both start and end times.'); return; }
    if (newSlot.startTime >= newSlot.endTime)   { setSlotErr('End must be after start.'); return; }
    setAdding(true); setSlotErr('');
    try {
      const saved = await addAvailabilitySlot(userId, newSlot);
      setSlots(s => [...s, saved]);
      setNewSlot({ dayOfWeek: 'MONDAY', startTime: '', endTime: '' });
    } catch { setSlotErr('Failed to add slot.'); }
    finally { setAdding(false); }
  };

  const handleDeleteSlot = async (id) => {
    try { await deleteAvailability(userId, id); setSlots(s => s.filter(sl => sl.id !== id)); }
    catch { alert('Could not remove slot.'); }
  };

  const parsedSkills = form.skillsText.split(',').map(s => s.trim()).filter(Boolean);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl">

        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 style={sg} className="text-lg font-bold text-gray-900">Edit Profile</h2>
            <p className="text-xs text-gray-400 mt-0.5">Changes are saved to your public profile</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-8">

          {/* Photo */}
          <div>
            <p style={sg} className="text-sm font-bold text-gray-800 mb-4">Profile Photo</p>
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold" style={{ background: getGrad(userId) }}>
                    {form.firstName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <button onClick={() => fileRef.current?.click()} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  Upload new photo
                </button>
                <p className="text-xs text-gray-400 mt-1">JPG or PNG · Auto-resized to 400px</p>
                {photoPreview && (
                  <button onClick={() => { setPhotoPreview(null); setForm(f => ({ ...f, photoUrl: '' })); }} className="text-xs text-red-400 hover:text-red-500 mt-1 block">
                    Remove photo
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <p style={sg} className="text-sm font-bold text-gray-800 mb-4">Basic Info</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-gray-500 font-medium mb-1.5 block">First Name</span>
                  <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
                    placeholder="First name" />
                </label>
                <label className="block">
                  <span className="text-xs text-gray-500 font-medium mb-1.5 block">Last Name</span>
                  <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
                    placeholder="Last name" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs text-gray-500 font-medium mb-1.5 block">Bio</span>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={4} placeholder="Tell students about yourself, your expertise and teaching style..."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white resize-none" />
              </label>
            </div>
          </div>

          {/* Professional */}
          <div>
            <p style={sg} className="text-sm font-bold text-gray-800 mb-4">Professional Info</p>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-gray-500 font-medium mb-1.5 block">Skills <span className="text-gray-400 font-normal">(comma-separated)</span></span>
                <input value={form.skillsText} onChange={e => setForm(f => ({ ...f, skillsText: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
                  placeholder="React, Node.js, Python, System Design" />
                {parsedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {parsedSkills.map(s => (
                      <span key={s} className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100">{s}</span>
                    ))}
                  </div>
                )}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-gray-500 font-medium mb-1.5 block">Hourly Rate (LKR)</span>
                  <input type="number" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
                    placeholder="5000" min="0" />
                </label>
                <label className="block">
                  <span className="text-xs text-gray-500 font-medium mb-1.5 block">Years of Experience</span>
                  <input type="number" value={form.yearsOfExperience} onChange={e => setForm(f => ({ ...f, yearsOfExperience: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
                    placeholder="3" min="0" />
                </label>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <p style={sg} className="text-sm font-bold text-gray-800 mb-4">Availability</p>
            {slots.length > 0 && (
              <div className="space-y-2 mb-4">
                {[...slots].sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)).map(slot => (
                  <div key={slot.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-semibold text-gray-700 w-8">{DAY_LABELS[slot.dayOfWeek]}</span>
                      <span className="text-sm text-gray-500">{fmt12(slot.startTime)} – {fmt12(slot.endTime)}</span>
                    </div>
                    <button onClick={() => handleDeleteSlot(slot.id)} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add new slot</p>
              <div className="grid grid-cols-3 gap-2">
                <select value={newSlot.dayOfWeek} onChange={e => setNewSlot(s => ({ ...s, dayOfWeek: e.target.value }))}
                  className="px-2 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  {DAY_ORDER.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                </select>
                <input type="time" value={newSlot.startTime} onChange={e => setNewSlot(s => ({ ...s, startTime: e.target.value }))}
                  className="px-2 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
                <input type="time" value={newSlot.endTime} onChange={e => setNewSlot(s => ({ ...s, endTime: e.target.value }))}
                  className="px-2 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
              </div>
              {slotErr && <p className="text-xs text-red-500">{slotErr}</p>}
              <button onClick={handleAddSlot} disabled={addingSlot}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" />
                {addingSlot ? 'Adding…' : 'Add Slot'}
              </button>
            </div>
          </div>

        </div>

        <div className="px-7 py-5 border-t border-gray-100 flex-shrink-0 space-y-2">
          {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 text-sm font-bold text-white rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Earnings Modal ─── */
const EarningsModal = ({ open, onClose, bookings, hourlyRate }) => {
  if (!open) return null;

  const rate = parseFloat(hourlyRate) || 0;

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');

  const sessionEarning = (b) => ((b.durationMinutes || 60) / 60) * rate;

  const totalEarnings = completedBookings.reduce((sum, b) => sum + sessionEarning(b), 0);

  const now = new Date();
  const thisMonthEarnings = completedBookings
    .filter(b => {
      const d = new Date(b.bookingDate + 'T00:00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, b) => sum + sessionEarning(b), 0);

  const avgEarning = completedBookings.length > 0 ? totalEarnings / completedBookings.length : 0;

  // Build last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const earnings = completedBookings
      .filter(b => {
        const bd = new Date(b.bookingDate + 'T00:00:00');
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      })
      .reduce((sum, b) => sum + sessionEarning(b), 0);
    const sessions = completedBookings.filter(b => {
      const bd = new Date(b.bookingDate + 'T00:00:00');
      return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
    }).length;
    months.push({ label, earnings, sessions });
  }

  const maxEarnings = Math.max(...months.map(m => m.earnings), 1);

  const fmtLKR = (n) => n >= 1000
    ? `LKR ${(n / 1000).toFixed(1)}k`
    : `LKR ${Math.round(n).toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 style={sg} className="text-lg font-bold text-gray-900">Earnings Analysis</h2>
              <p className="text-xs text-gray-400 mt-0.5">Based on completed sessions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-7">

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Earned',     value: fmtLKR(totalEarnings),   sub: `${completedBookings.length} sessions`,  color: 'bg-indigo-500' },
              { label: 'This Month',        value: fmtLKR(thisMonthEarnings), sub: 'Current month',                       color: 'bg-emerald-500' },
              { label: 'Avg per Session',   value: fmtLKR(avgEarning),       sub: `LKR ${rate}/hr rate`,                  color: 'bg-violet-500' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <p style={sg} className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Monthly bar chart */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 style={sg} className="text-sm font-bold text-gray-900">Monthly Breakdown</h3>
              <span className="text-xs text-gray-400">Last 6 months</span>
            </div>

            {completedBookings.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-100 py-12 text-center">
                <BarChart2 className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No completed sessions yet</p>
                <p className="text-xs text-gray-400 mt-1">Earnings will appear here once you complete sessions.</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                {/* Bars */}
                <div className="flex items-end gap-3 h-40 mb-4">
                  {months.map((m, i) => {
                    const heightPct = maxEarnings > 0 ? (m.earnings / maxEarnings) * 100 : 0;
                    const isCurrent = i === months.length - 1;
                    return (
                      <div key={m.label} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full flex flex-col justify-end" style={{ height: '100%' }}>
                          {m.earnings > 0 && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10">
                              {fmtLKR(m.earnings)}<br />
                              <span className="text-gray-400">{m.sessions} session{m.sessions !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          <div
                            className="w-full rounded-t-xl transition-all duration-500"
                            style={{
                              height: `${Math.max(heightPct, m.earnings > 0 ? 4 : 0)}%`,
                              background: isCurrent
                                ? 'linear-gradient(180deg,#4F46E5,#7C3AED)'
                                : m.earnings > 0 ? '#C7D2FE' : '#F3F4F6',
                              minHeight: m.earnings > 0 ? '6px' : '0',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* X-axis labels */}
                <div className="flex gap-3">
                  {months.map((m, i) => (
                    <div key={m.label} className="flex-1 text-center">
                      <p className={`text-xs font-medium ${i === months.length - 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {m.label.split(' ')[0]}
                      </p>
                      {m.sessions > 0 && (
                        <p className="text-xs text-gray-400">{m.sessions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Session breakdown table */}
          {completedBookings.length > 0 && (
            <div>
              <h3 style={sg} className="text-sm font-bold text-gray-900 mb-4">Session History</h3>
              <div className="space-y-2">
                {completedBookings.slice(0, 8).map((b) => {
                  const d = new Date(b.bookingDate + 'T00:00:00');
                  const earned = sessionEarning(b);
                  return (
                    <div key={b.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div>
                          <p style={sg} className="text-sm font-semibold text-gray-800">Student #{b.studentId}</p>
                          <p className="text-xs text-gray-400">
                            {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {b.durationMinutes} min
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p style={sg} className="text-sm font-bold text-emerald-600">+LKR {Math.round(earned).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">LKR {rate}/hr</p>
                      </div>
                    </div>
                  );
                })}
                {completedBookings.length > 8 && (
                  <p className="text-xs text-gray-400 text-center pt-2">+{completedBookings.length - 8} more sessions</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* ─── Main Dashboard ─── */
const MentorDashboardPage = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings]       = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [availability, setAvailability]   = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);
  const [activeTab, setActiveTab]     = useState('requests');
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [earningsOpen, setEarningsOpen] = useState(false);
  const [copied, setCopied]             = useState(false);

  const fetchAll = async () => {
    setIsLoading(true); setError(null);
    try {
      const [pr, mr, br, ar] = await Promise.allSettled([
        getProfile(user.userId), getMentorProfile(user.userId),
        getMentorBookings(), getMentorAvailability(user.userId),
      ]);
      if (pr.status === 'fulfilled') setUserProfile(pr.value);
      else { navigate('/mentor/onboarding', { replace: true }); return; }
      if (mr.status === 'fulfilled') setMentorProfile(mr.value);
      if (br.status === 'fulfilled') setBookings(br.value || []);
      if (ar.status === 'fulfilled') setAvailability(ar.value || []);
    } catch { setError('Failed to load dashboard.'); }
    finally  { setIsLoading(false); }
  };

  useEffect(() => { if (user?.userId) fetchAll(); }, [user]);

  const handleAccept   = async (id) => { try { await acceptBooking(id);   fetchAll(); } catch { alert('Failed.'); } };
  const handleReject   = async (id) => { if (!window.confirm('Decline?')) return; try { await rejectBooking(id);  fetchAll(); } catch { alert('Failed.'); } };
  const handleComplete = async (id) => { if (!window.confirm('Mark complete?')) return; try { await completeSession(id); fetchAll(); } catch { alert('Failed.'); } };

  const pendingBookings   = bookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const pastBookings      = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
  const completedCount    = bookings.filter(b => b.status === 'COMPLETED').length;

  const displayList =
    activeTab === 'requests' ? pendingBookings   :
    activeTab === 'upcoming' ? confirmedBookings : pastBookings;

  const firstName = userProfile?.firstName || user?.email?.split('@')[0] || 'there';
  const fullName  = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ') || 'Mentor';
  const initials  = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const skills    = mentorProfile?.skills ? mentorProfile.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  const rating    = parseFloat(mentorProfile?.averageRating) || 0;
  const profileUrl = `${window.location.origin}/mentors/${user?.userId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sortedSlots = [...availability].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB]">

      {/* ── Hero banner ── */}
      <div style={{ background: 'linear-gradient(135deg, #1a1756 0%, #312e81 60%, #4338ca 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

            {/* Identity */}
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {userProfile?.profilePictureUrl ? (
                  <img src={userProfile.profilePictureUrl} alt={fullName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-xl" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl"
                    style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.2)' }}>
                    {initials}
                  </div>
                )}
                <button onClick={() => setDrawerOpen(true)}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                </button>
              </div>
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Mentor</p>
                <h1 style={sg} className="text-2xl font-bold text-white">{fullName}</h1>
                {skills.length > 0 && (
                  <p className="text-white/70 text-sm mt-0.5">{skills.slice(0, 3).join(' · ')}</p>
                )}
              </div>
            </div>

            {/* Hero stats */}
            <div className="flex items-center gap-6 sm:gap-8">
              <div className="text-center">
                <p style={sg} className="text-3xl font-bold text-white">{completedCount}</p>
                <p className="text-white/60 text-xs mt-0.5">Sessions</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p style={sg} className="text-3xl font-bold text-white">
                  {rating > 0 ? rating.toFixed(1) : '—'}
                </p>
                <p className="text-white/60 text-xs mt-0.5">Rating</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p style={sg} className="text-3xl font-bold text-white">
                  {mentorProfile?.hourlyRate ? `${mentorProfile.hourlyRate}` : '—'}
                </p>
                <p className="text-white/60 text-xs mt-0.5">LKR / hr</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => setDrawerOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <Link to={`/mentors/${user?.userId}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-900 bg-white rounded-xl hover:bg-indigo-50 transition-colors">
                  <ExternalLink className="w-4 h-4" /> View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
            </div>
            <div className="space-y-4">
              {[1,2].map(i => <div key={i} className="h-36 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
            </div>
          </div>
        ) : error ? (
          <p className="text-sm text-red-400 text-center py-12">{error}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Stat cards */}
              {(() => {
                const rate = parseFloat(mentorProfile?.hourlyRate) || 0;
                const totalEarnings = bookings
                  .filter(b => b.status === 'COMPLETED')
                  .reduce((sum, b) => sum + ((b.durationMinutes || 60) / 60) * rate, 0);
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { icon: Zap,        label: 'Pending',   value: pendingBookings.length,   iconBg: 'bg-amber-500',  highlight: pendingBookings.length > 0, onClick: null },
                      { icon: Calendar,   label: 'Upcoming',  value: confirmedBookings.length, iconBg: 'bg-indigo-500', highlight: false, onClick: null },
                      { icon: TrendingUp, label: 'Completed', value: completedCount,           iconBg: 'bg-emerald-500',highlight: false, onClick: null },
                      { icon: BarChart2,  label: 'Earnings',
                        value: totalEarnings >= 1000 ? `${(totalEarnings/1000).toFixed(1)}k` : Math.round(totalEarnings).toLocaleString(),
                        sub: 'LKR',
                        iconBg: 'bg-violet-500', highlight: false, onClick: () => setEarningsOpen(true) },
                    ].map(({ icon: Icon, label, value, sub, iconBg, highlight, onClick }) => (
                      <div
                        key={label}
                        onClick={onClick || undefined}
                        className={`bg-white rounded-2xl border p-5 flex items-center gap-4 ${highlight ? 'border-amber-200 shadow-sm shadow-amber-100' : 'border-gray-100'} ${onClick ? 'cursor-pointer hover:border-violet-200 hover:shadow-sm group' : ''}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-1">
                            {sub && <span className="text-xs text-gray-400 font-medium">{sub}</span>}
                            <p style={sg} className="text-2xl font-bold text-gray-900 truncate">{value}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 leading-tight flex items-center gap-1">
                            {label}
                            {onClick && <ArrowUpRight className="w-3 h-3 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Sessions card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 px-7 pt-6 gap-1">
                  {[
                    { key: 'requests', label: 'Requests', count: pendingBookings.length,   dot: pendingBookings.length > 0 },
                    { key: 'upcoming', label: 'Upcoming', count: confirmedBookings.length, dot: false },
                    { key: 'history',  label: 'History',  count: pastBookings.length,      dot: false },
                  ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-2.5 mb-[-1px] text-sm font-semibold rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === tab.key
                          ? 'text-indigo-600 border-indigo-500 bg-indigo-50/50'
                          : 'text-gray-400 border-transparent hover:text-gray-600'
                      }`}>
                      {tab.label}
                      {tab.dot ? (
                        <span className="w-5 h-5 text-xs font-bold text-white bg-amber-500 rounded-full flex items-center justify-center">{tab.count}</span>
                      ) : (
                        <span className="text-xs opacity-50">{tab.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {displayList.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-gray-100 py-16 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                        {activeTab === 'requests' ? <Zap className="w-7 h-7 text-gray-300" /> :
                         activeTab === 'upcoming' ? <Calendar className="w-7 h-7 text-gray-300" /> :
                         <TrendingUp className="w-7 h-7 text-gray-300" />}
                      </div>
                      <p style={sg} className="text-base font-semibold text-gray-600 mb-1">
                        {activeTab === 'requests' ? 'No pending requests' :
                         activeTab === 'upcoming' ? 'No upcoming sessions' :
                         'No history yet'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {activeTab === 'requests' ? 'New booking requests will show up here.' :
                         activeTab === 'upcoming' ? 'Accepted sessions will appear here.' :
                         'Completed and cancelled sessions will appear here.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayList.map((booking) => {
                        const cfg    = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                        const accent = ACCENT[booking.status] || '#9CA3AF';
                        const { day, month, weekday } = getDateParts(booking.bookingDate);
                        return (
                          <div key={booking.id}
                            className="flex items-stretch rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all">
                            <div className="w-1.5 flex-shrink-0" style={{ background: accent }} />
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 bg-gray-50 border-r border-gray-100 py-4 px-2">
                              <span className="text-xs font-bold text-gray-400 tracking-wider">{month}</span>
                              <span style={sg} className="text-3xl font-bold text-gray-800 leading-none mt-1">{day}</span>
                              <span className="text-xs text-gray-400 mt-1">{weekday}</span>
                            </div>
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                              <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span style={sg} className="text-base font-bold text-gray-900">Student #{booking.studentId}</span>
                                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
                                    {cfg.label}
                                  </span>
                                </div>
                                {booking.startTime && (
                                  <span className="flex items-center gap-1.5 text-sm text-gray-400 mt-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {fmt12(booking.startTime)} · {booking.durationMinutes} min
                                  </span>
                                )}
                                {booking.notes && (
                                  <p className="mt-1.5 text-sm text-gray-400 italic line-clamp-1">"{booking.notes}"</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {booking.status === 'PENDING' && (
                                  <>
                                    <button onClick={() => handleAccept(booking.id)}
                                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors">
                                      <Check className="w-4 h-4" /> Accept
                                    </button>
                                    <button onClick={() => handleReject(booking.id)}
                                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-red-500 bg-white border border-red-100 hover:bg-red-50 rounded-xl transition-colors">
                                      <X className="w-4 h-4" /> Decline
                                    </button>
                                  </>
                                )}
                                {booking.status === 'CONFIRMED' && (
                                  <button onClick={() => handleComplete(booking.id)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
                                    style={{ background: '#4F46E5' }}>
                                    <CheckCircle2 className="w-4 h-4" /> Mark Complete
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

            {/* ── RIGHT SIDEBAR ── */}
            <div className="space-y-5">

              {/* Share your profile */}
              <div className="rounded-2xl overflow-hidden border border-indigo-100" style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)' }}>
                <div className="px-5 pt-5 pb-4">
                  <p style={sg} className="text-sm font-bold text-indigo-900 mb-1">Share Your Profile</p>
                  <p className="text-xs text-indigo-600/70 mb-3">Let students find and book you directly.</p>
                  <div className="flex items-center gap-2 bg-white border border-indigo-100 rounded-xl px-3 py-2.5">
                    <span className="text-xs text-gray-500 truncate flex-1">/mentors/{user?.userId}</span>
                    <button onClick={copyLink} className="flex-shrink-0 text-indigo-500 hover:text-indigo-700 transition-colors">
                      {copied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <Link to={`/mentors/${user?.userId}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl transition-colors">
                    View Public Profile <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Earnings quick card */}
              {(() => {
                const rate = parseFloat(mentorProfile?.hourlyRate) || 0;
                const completed = bookings.filter(b => b.status === 'COMPLETED');
                const total = completed.reduce((sum, b) => sum + ((b.durationMinutes || 60) / 60) * rate, 0);
                const now = new Date();
                const thisMonth = completed.filter(b => {
                  const d = new Date(b.bookingDate + 'T00:00:00');
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).reduce((sum, b) => sum + ((b.durationMinutes || 60) / 60) * rate, 0);
                const fmtLKR = (n) => n >= 1000 ? `LKR ${(n/1000).toFixed(1)}k` : `LKR ${Math.round(n).toLocaleString()}`;
                return (
                  <div
                    onClick={() => setEarningsOpen(true)}
                    className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:border-violet-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500">
                          <BarChart2 className="w-4 h-4 text-white" />
                        </div>
                        <p style={sg} className="text-sm font-bold text-gray-900">Earnings</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p style={sg} className="text-lg font-bold text-gray-900">{fmtLKR(total)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Total earned</p>
                      </div>
                      <div className="bg-violet-50 rounded-xl p-3">
                        <p style={sg} className="text-lg font-bold text-violet-700">{fmtLKR(thisMonth)}</p>
                        <p className="text-xs text-violet-400 mt-0.5">This month</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center group-hover:text-violet-500 transition-colors">
                      View full analysis →
                    </p>
                  </div>
                );
              })()}

              {/* Bio card */}
              {userProfile?.bio && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p style={sg} className="text-sm font-bold text-gray-900 mb-2">Your Bio</p>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">{userProfile.bio}</p>
                  <button onClick={() => setDrawerOpen(true)} className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 mt-2 transition-colors">
                    Edit bio
                  </button>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p style={sg} className="text-sm font-bold text-gray-900">Your Skills</p>
                    <button onClick={() => setDrawerOpen(true)} className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
                      Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s} className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p style={sg} className="text-sm font-bold text-gray-900">Availability</p>
                  <button onClick={() => setDrawerOpen(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {sortedSlots.length > 0 ? (
                  <div className="space-y-2.5">
                    {sortedSlots.slice(0, 6).map(slot => (
                      <div key={slot.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-700 w-8">{DAY_LABELS[slot.dayOfWeek]}</span>
                        </div>
                        <span className="text-sm text-gray-400">{fmt12(slot.startTime)} – {fmt12(slot.endTime)}</span>
                      </div>
                    ))}
                    {sortedSlots.length > 6 && (
                      <p className="text-xs text-gray-400">+{sortedSlots.length - 6} more slots</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400 mb-2">No slots added yet</p>
                    <button onClick={() => setDrawerOpen(true)} className="text-sm font-semibold text-indigo-500 hover:text-indigo-600">
                      Add your first slot
                    </button>
                  </div>
                )}
              </div>

              {/* No bio nudge */}
              {!userProfile?.bio && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-5 text-center">
                  <p style={sg} className="text-sm font-semibold text-gray-700 mb-1">Complete your profile</p>
                  <p className="text-xs text-gray-400 mb-3">Add a bio to help students understand your background.</p>
                  <button onClick={() => setDrawerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg"
                    style={{ background: '#4F46E5' }}>
                    <Edit2 className="w-3.5 h-3.5" /> Add Bio
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      <EditProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userId={user?.userId}
        userProfile={userProfile}
        mentorProfile={mentorProfile}
        availability={availability}
        onSaved={fetchAll}
      />

      <EarningsModal
        open={earningsOpen}
        onClose={() => setEarningsOpen(false)}
        bookings={bookings}
        hourlyRate={mentorProfile?.hourlyRate}
      />
    </div>
  );
};

export default MentorDashboardPage;
