import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '@/api/authApi';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Zap, Shield, Star } from 'lucide-react';

const sg = { fontFamily: "'Space Grotesk', sans-serif" };

const gradientText = {
  background: 'linear-gradient(120deg, #A5B4FC 0%, #C4B5FD 55%, #F0ABFC 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Booking',
    desc: 'Schedule sessions with top mentors in seconds — no back-and-forth.',
    iconBg: 'rgba(99,102,241,0.25)',
    iconColor: '#A5B4FC',
  },
  {
    icon: Shield,
    title: 'Verified Mentors',
    desc: 'Every mentor is vetted for experience and communication quality.',
    iconBg: 'rgba(16,185,129,0.2)',
    iconColor: '#6EE7B7',
  },
  {
    icon: Star,
    title: 'Real Reviews',
    desc: 'Honest ratings from students after every completed session.',
    iconBg: 'rgba(245,158,11,0.2)',
    iconColor: '#FDE68A',
  },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginContext } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      loginContext(data.accessToken);
      if (data.role === 'STUDENT') {
        const from = location.state?.from?.pathname || '/mentors';
        navigate(from, { replace: true });
      } else {
        navigate('/mentor-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-14 relative overflow-hidden select-none">

        {/* Blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-20 w-[28rem] h-[28rem] rounded-full bg-violet-900/40" />
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-indigo-500/20 -translate-y-1/2 translate-x-1/2" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-indigo-600" />
          </div>
          <span style={sg} className="text-white font-bold text-xl tracking-tight">SkillBridge</span>
        </div>

        {/* Hero */}
        <div className="relative space-y-7">
          <div>
            {/* Eyebrow */}
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-indigo-300 mb-4">
              Mentorship Platform
            </p>

            <h1 style={{ ...sg, fontSize: '52px', lineHeight: '1.08', fontWeight: 700 }}
              className="text-white tracking-tight">
              Find your<br />
              <span style={gradientText}>perfect mentor.</span>
            </h1>

            <p className="mt-4 text-indigo-200/80 text-base leading-relaxed max-w-[320px] font-light">
              Book one-on-one sessions with verified industry experts and land your dream role.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: iconBg, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Icon className="w-4 h-4" style={{ color: iconColor }} />
                </div>
                <div>
                  <p style={sg} className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-indigo-300/70 text-xs leading-snug mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative border-t border-white/10 pt-6">
          <p className="text-indigo-200/80 text-sm italic leading-relaxed">
            "SkillBridge helped me crack my IFS interview. My mentor was incredible."
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              KP
            </div>
            <div>
              <p style={sg} className="text-white text-sm font-semibold">Kavindra Perera</p>
              <p className="text-indigo-300/60 text-xs">Software Engineer, IFS</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span style={sg} className="font-bold text-gray-900 text-lg">SkillBridge</span>
          </div>

          {/* Heading block */}
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-indigo-500 mb-2">
              Welcome back
            </p>
            <h2 style={{ ...sg, fontSize: '30px', lineHeight: '1.15', fontWeight: 700, color: '#111827' }}>
              Sign in to your{' '}
              <span style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>account</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              No account yet?{' '}
              <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                Create one free →
              </Link>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 transition-colors"
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
                className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 transition-colors"
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
              className="w-full h-11 text-white font-semibold rounded-xl transition-all duration-200 group mt-1 border-0 shadow-lg shadow-indigo-200"
              style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </>
              )}
            </Button>
          </form>

          {/* Trust row */}
          <div className="flex items-center gap-5 mt-9 pt-7 border-t border-gray-100">
            {[
              { icon: '🔒', label: 'Secure login' },
              { icon: '✦', label: 'Free to join' },
              { icon: '✓', label: 'No credit card' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-indigo-400 text-xs">{icon}</span>
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
