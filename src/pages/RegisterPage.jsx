import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '@/api/authApi';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, ArrowLeft, Zap, GraduationCap, BriefcaseBusiness, CheckCircle2 } from 'lucide-react';

const sg = { fontFamily: "'Space Grotesk', sans-serif" };

const PERKS = [
  { title: 'Expert mentors', desc: 'Verified industry professionals across 20+ fields.' },
  { title: 'Flexible scheduling', desc: 'Book sessions that fit your calendar, any time zone.' },
  { title: 'Real progress', desc: 'Track your growth with structured session outcomes.' },
];

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginContext } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await register(email, password, role);
      loginContext(data.accessToken);
      if (role === 'MENTOR') {
        navigate('/mentor/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-14 relative overflow-hidden select-none">

        {/* Blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-20 w-[28rem] h-[28rem] rounded-full bg-indigo-900/40" />
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-violet-500/20 -translate-y-1/2 translate-x-1/2" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-violet-600" />
          </div>
          <span style={sg} className="text-white font-bold text-xl tracking-tight">SkillBridge</span>
        </div>

        {/* Hero */}
        <div className="relative space-y-7">
          <div>
            {/* Eyebrow */}
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-300 mb-4">
              Join the Community
            </p>

            <h1 style={{ ...sg, fontSize: '52px', lineHeight: '1.08', fontWeight: 700, color: 'white' }}>
              Join a community<br />
              <span style={{
                background: 'linear-gradient(120deg, #C4B5FD 0%, #F0ABFC 55%, #FCA5A5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                built for growth.
              </span>
            </h1>

            <p className="mt-4 text-violet-200/80 text-base leading-relaxed max-w-[320px] font-light">
              Whether you're seeking guidance or ready to mentor — SkillBridge is where careers are built.
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-4">
            {PERKS.map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#C4B5FD' }} />
                </div>
                <div>
                  <p style={sg} className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-violet-300/70 text-xs leading-snug mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust row */}
        <div className="relative border-t border-white/10 pt-6">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-violet-300/60 mb-3">
            Why SkillBridge?
          </p>
          <div className="flex flex-col gap-1.5">
            {[
              'One-on-one sessions with real industry professionals',
              'Built for Sri Lankan students & tech careers',
              'Free to join — no hidden fees, ever',
            ].map((line) => (
              <p key={line} className="text-violet-200/60 text-xs leading-snug flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">→</span>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Back to login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-600 transition-colors group mb-8"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to login
          </Link>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span style={sg} className="font-bold text-gray-900 text-lg">SkillBridge</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-violet-500 mb-2">
              Get started
            </p>
            <h2 style={{ ...sg, fontSize: '30px', lineHeight: '1.15', fontWeight: 700, color: '#111827' }}>
              Create your{' '}
              <span style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>account</span>
            </h2>
            <p className="text-gray-400 mt-1.5 text-sm">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Role selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-widest uppercase text-gray-500">
                I want to join as
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'STUDENT', icon: GraduationCap, label: 'Student', desc: 'Find mentors & book sessions' },
                  { value: 'MENTOR', icon: BriefcaseBusiness, label: 'Mentor', desc: 'Share your expertise' },
                ].map(({ value, icon: Icon, label, desc }) => {
                  const selected = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center"
                      style={{
                        borderColor: selected ? '#7C3AED' : '#E5E7EB',
                        backgroundColor: selected ? 'rgba(124,58,237,0.05)' : '#F9FAFB',
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: selected ? '#7C3AED' : '#9CA3AF' }} />
                      <span className="text-sm font-semibold" style={{ ...sg, color: selected ? '#6D28D9' : '#374151' }}>
                        {label}
                      </span>
                      <span className="text-xs leading-tight text-gray-400">{desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email"
                className="text-xs font-semibold tracking-widest uppercase text-gray-500">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-violet-500 focus-visible:border-violet-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password"
                className="text-xs font-semibold tracking-widest uppercase text-gray-500">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-violet-500 focus-visible:border-violet-400 transition-colors"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-white font-semibold rounded-xl transition-all duration-200 group mt-1 border-0 shadow-lg shadow-violet-200"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </>
              )}
            </Button>

            <p className="text-center text-gray-400 text-xs pt-1">
              By creating an account you agree to our{' '}
              <span className="underline cursor-pointer hover:text-gray-600 transition-colors">Terms of Service</span>
            </p>
          </form>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
