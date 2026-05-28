import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Search, Star, ArrowRight, Check, Calendar, TrendingUp,
  ChevronRight, Users, Shield, Clock, DollarSign, BookOpen,
  Award, Menu, X, Quote,
} from 'lucide-react';

const sg    = { fontFamily: "'Space Grotesk', sans-serif" };
const BRAND = 'linear-gradient(135deg,#4F46E5,#7C3AED)';
const HERO  = 'linear-gradient(135deg,#1a1756 0%,#312e81 60%,#4338ca 100%)';


const HERO_BG_IMAGE = '/images/hero-bg.png';
const DUAL_BG_IMAGE = '/images/dual-bg.png';

/* ─── Inline brand logos (for logos that don't render well from CDN) ─── */

const GoogleLogo = () => (
  <span style={{ fontSize:'28px', fontWeight:800, fontFamily:'Arial,sans-serif', letterSpacing:'-0.5px', lineHeight:1 }}>
    <span style={{ color:'#4285F4' }}>G</span>
    <span style={{ color:'#EA4335' }}>o</span>
    <span style={{ color:'#FBBC05' }}>o</span>
    <span style={{ color:'#4285F4' }}>g</span>
    <span style={{ color:'#34A853' }}>l</span>
    <span style={{ color:'#EA4335' }}>e</span>
  </span>
);

const SlackLogo = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
    <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
    <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0"/>
    <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
    <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/>
    <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
    <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/>
    <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
  </svg>
);

const LinkedInLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="8" fill="#0A66C2"/>
    <circle cx="12" cy="13" r="3.5" fill="white"/>
    <rect x="8.5" y="18" width="7" height="13" rx="2" fill="white"/>
    <rect x="19" y="18" width="7" height="13" rx="2" fill="white"/>
    <path d="M26 23.5C26 21 27.5 19.5 30 19.5C32.5 19.5 33.5 21 33.5 23.5V31H27V23.5z" fill="white"/>
    <rect x="26" y="18" width="7.5" height="5" rx="0" fill="#0A66C2"/>
    <path d="M26 23.5C26 21 27.5 19.5 30 19.5C32.5 19.5 33.5 21 33.5 23.5V31H27V23.5z" fill="white"/>
  </svg>
);

const FigmaLogo = () => (
  <svg width="28" height="42" viewBox="0 0 28 42" fill="none">
    <rect x="0" y="0" width="13" height="28" rx="6.5" fill="#F24E1E"/>
    <rect x="15" y="0" width="13" height="13" rx="6.5" fill="#A259FF"/>
    <rect x="0" y="29" width="13" height="13" rx="6.5" fill="#FF7262"/>
    <circle cx="21.5" cy="21" r="6.5" fill="#1ABCFE"/>
    <circle cx="6.5" cy="21" r="6.5" fill="#0ACF83"/>
  </svg>
);

const gradText = {
  background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

/* ─── Data ─────────────────────────────────────────────── */

const AVATARS = [
  { initials:'NK', name:'Nadeesha K.', skill:'Backend Engineer',   grad:'linear-gradient(135deg,#4F46E5,#7C3AED)', style:{ top:'12%',  left:'4%'   } },
  { initials:'JL', name:'James L.',    skill:'Data Scientist',      grad:'linear-gradient(135deg,#0EA5E9,#2563EB)', style:{ top:'8%',   right:'5%'  } },
  { initials:'SM', name:'Sara M.',     skill:'UX Designer',         grad:'linear-gradient(135deg,#EC4899,#8B5CF6)', style:{ top:'42%',  left:'1%'   } },
  { initials:'AT', name:'Alex T.',     skill:'DevOps Engineer',     grad:'linear-gradient(135deg,#10B981,#0D9488)', style:{ top:'38%',  right:'2%'  } },
  { initials:'RK', name:'Raj K.',      skill:'ML Engineer',         grad:'linear-gradient(135deg,#F59E0B,#EF4444)', style:{ bottom:'22%', left:'5%' } },
  { initials:'LP', name:'Luna P.',     skill:'Product Manager',     grad:'linear-gradient(135deg,#6366F1,#A855F7)', style:{ bottom:'18%', right:'4%'} },
];

const COMPANIES = [
  { name:'Spotify',  slug:'spotify', color:'1DB954', text:'#1DB954' },
  { name:'Slack',    Logo: SlackLogo,                text:'#4A154B' },
  { name:'Airbnb',   slug:'airbnb',  color:'FF5A5F', text:'#FF5A5F' },
  { name:'Google',   Logo: GoogleLogo },
  { name:'Amazon',   slug:'amazon',  color:'FF9900', text:'#FF9900' },
  { name:'Stripe',   slug:'stripe',  color:'635BFF', text:'#635BFF' },
  { name:'Netflix',  slug:'netflix', color:'E50914', text:'#E50914' },
  { name:'Meta',     slug:'meta',    color:'0866FF', text:'#0866FF' },
  { name:'Figma',    Logo: FigmaLogo,                text:'#F24E1E' },
  { name:'LinkedIn', Logo: LinkedInLogo,             text:'#0A66C2' },
  { name:'Uber',     slug:'uber',    color:'000000', text:'#1C1C1C' },
  { name:'Twitch',   slug:'twitch',  color:'9146FF', text:'#9146FF' },
];

const STATS = [
  { value:'500+',   label:'Expert Mentors',    color:'#4F46E5', bg:'rgba(79,70,229,0.08)'   },
  { value:'2,400+', label:'Sessions Booked',   color:'#7C3AED', bg:'rgba(124,58,237,0.08)'  },
  { value:'4.9★',   label:'Average Rating',    color:'#F59E0B', bg:'rgba(245,158,11,0.08)'  },
  { value:'30+',    label:'Skills Covered',    color:'#10B981', bg:'rgba(16,185,129,0.08)'  },
];

const STEPS = [
  { num:'01', Icon:Search,      title:'Find your mentor',    desc:'Browse 500+ verified mentors by skill, experience, or price. Every mentor is reviewed and approved.', color:'#4F46E5' },
  { num:'02', Icon:Calendar,    title:'Book a session',      desc:'See real-time availability and confirm instantly. No back-and-forth emails — just pick a slot and go.', color:'#7C3AED' },
  { num:'03', Icon:TrendingUp,  title:'Grow your career',    desc:'1-on-1 sessions built around your goals. Get actionable advice from someone who has already done it.', color:'#10B981' },
];

const MENTORS = [
  { initials:'NK', name:'Nadeesha K.', role:'Senior Backend Engineer', company:'Sysco LABS',      skills:['Java','Spring Boot','PostgreSQL'], rate:8000, rating:4.9, reviews:47, grad:'linear-gradient(135deg,#4F46E5,#7C3AED)' },
  { initials:'AS', name:'Ashan S.',    role:'ML Engineer',             company:'WSO2',             skills:['Python','TensorFlow','ML'],        rate:7500, rating:4.8, reviews:32, grad:'linear-gradient(135deg,#0EA5E9,#2563EB)' },
  { initials:'DW', name:'Dilki W.',    role:'UX / Product Designer',   company:'Rootcode Labs',    skills:['Figma','UX Design','Prototyping'],  rate:6000, rating:5.0, reviews:28, grad:'linear-gradient(135deg,#EC4899,#8B5CF6)' },
  { initials:'RS', name:'Ruwan S.',    role:'Cloud & DevOps Engineer', company:'IFS R&D',          skills:['AWS','Docker','Kubernetes'],        rate:9000, rating:4.7, reviews:19, grad:'linear-gradient(135deg,#10B981,#0D9488)' },
];

const TESTIMONIALS = [
  { text:'"SkillBridge helped me land my first SWE role. My mentor reviewed my resume, ran mock interviews, and gave me a clear roadmap. I went from zero offers to two in 6 weeks."', name:'Kavisha P.',  role:'Junior Software Engineer', company:'Dialog Axiata',       rating:5, initials:'KP', grad:'linear-gradient(135deg,#4F46E5,#7C3AED)' },
  { text:'"I was switching from marketing to product management with no idea where to start. Three sessions later I had a portfolio, a strategy, and the confidence to apply."',        name:'Thisara M.', role:'Associate Product Manager', company:'Calcey Technologies', rating:5, initials:'TM', grad:'linear-gradient(135deg,#F59E0B,#EF4444)' },
  { text:'"My mentor specialises in exactly what I needed — AWS cloud architecture. Got promoted to senior engineer within 4 months. Every rupee was worth it."',                       name:'Binura F.',  role:'Cloud Engineer',           company:'hSenid Mobile',       rating:5, initials:'BF', grad:'linear-gradient(135deg,#10B981,#0D9488)' },
];

const STUDENT_PERKS = [
  'Browse 500+ vetted mentors across 30+ skills',
  'Real-time availability — book instantly, no emails',
  'Flexible 1-on-1 sessions tailored to your goals',
  'Verified reviews from real students',
  'Cancel or reschedule up to 24 hrs before',
  'Starting from LKR 3,000 / hr',
];

const MENTOR_PERKS = [
  'Set your own hourly rate in LKR',
  'Control your availability, accept who you want',
  'Build a public profile with student reviews',
  'Get paid after every completed session',
  'Reach ambitious students across Sri Lanka',
  'Zero upfront cost — join free',
];

/* ─── Sub-components ─────────────────────────────────────── */

const StarRow = ({ n = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: n }).map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
    ))}
  </div>
);

/* ─── Sections ───────────────────────────────────────────── */

function PublicNav() {
  const [open, setOpen] = useState(false);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 72; // navbar height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100" style={sg}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: BRAND }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">SkillBridge</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/mentors" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">Browse Mentors</Link>
            <a href="#how"     onClick={e => scrollToSection(e, 'how')}     className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#mentors" onClick={e => scrollToSection(e, 'mentors')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">For Mentors</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">Sign in</Link>
            <Link to="/register"
              className="px-5 py-2 text-sm font-bold text-white rounded-xl hover:shadow-md hover:shadow-indigo-200 transition-all"
              style={{ background: BRAND }}>
              Get Started
            </Link>
          </div>

          <button className="md:hidden p-2 text-gray-500 hover:text-gray-800" onClick={() => setOpen(v => !v)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          <Link to="/mentors"  onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-xl hover:bg-indigo-50">Browse Mentors</Link>
          <a href="#how"       onClick={e => scrollToSection(e, 'how')}     className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-xl hover:bg-indigo-50">How it Works</a>
          <a href="#mentors"   onClick={e => scrollToSection(e, 'mentors')} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-xl hover:bg-indigo-50">For Mentors</a>
          <Link to="/login"    onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-xl hover:bg-indigo-50">Sign in</Link>
          <Link to="/register" onClick={() => setOpen(false)}
            className="block px-3 py-2.5 text-sm font-bold text-white rounded-xl text-center"
            style={{ background: BRAND }}>
            Get Started Free
          </Link>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="min-h-screen flex items-center pt-16"
      style={HERO_BG_IMAGE
        ? { backgroundImage:`url(${HERO_BG_IMAGE})`, backgroundSize:'cover', backgroundPosition:'center' }
        : undefined
      }>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border"
          style={{ background:'rgba(79,70,229,0.07)', color:'#4F46E5', borderColor:'rgba(79,70,229,0.18)' }}>
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
          Now live · 500+ mentors ready to help
          <ChevronRight className="w-3.5 h-3.5" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-6" style={sg}>
          Accelerate your career<br />
          with a{' '}
          <span style={gradText}>personal mentor</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Connect with verified industry experts across Sri Lanka. Book 1-on-1 sessions,
          get real career advice, and grow faster than you ever thought possible.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all"
            style={{ background: BRAND }}>
            Start for free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/mentors"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-gray-700 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:-translate-y-0.5 transition-all shadow-sm">
            Browse mentors
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex -space-x-2.5">
            {['linear-gradient(135deg,#4F46E5,#7C3AED)','linear-gradient(135deg,#0EA5E9,#2563EB)','linear-gradient(135deg,#10B981,#0D9488)','linear-gradient(135deg,#EC4899,#8B5CF6)','linear-gradient(135deg,#F59E0B,#EF4444)'].map((g, i) => (
              <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ background: g }}>
                {['KP','TM','BF','AS','DW'][i]}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Trusted by students at{' '}
            <span className="font-semibold text-gray-700">Moratuwa, SLIIT, IIT, NSBM</span>
            {' '}and more
          </p>
        </div>

      </div>
    </section>
  );
}

function TrustSection() {
  const track = [...COMPANIES, ...COMPANIES];
  return (
    <section className="border-y border-gray-100 bg-white py-14 overflow-hidden">
      <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-12" style={sg}>
        Mentors from leading companies worldwide
      </p>

      <div className="relative">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-40 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, white 30%, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-40 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, white 30%, transparent)' }} />

        <div
          className="flex items-center"
          style={{ animation: 'marquee 35s linear infinite', width: 'max-content' }}
        >
          {track.map((c, i) => (
            <div key={i} className="flex items-center gap-3 mx-10 select-none">
              {c.Logo
                ? <c.Logo />
                : <img
                    src={`https://cdn.simpleicons.org/${c.slug}/${c.color}`}
                    alt={c.name}
                    className="w-10 h-10 flex-shrink-0"
                    draggable={false}
                  />
              }
              {c.name !== 'Google' && (
                <span
                  className="text-2xl font-extrabold whitespace-nowrap tracking-tight"
                  style={{ ...sg, color: c.text }}
                >
                  {c.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-20 bg-[#F8F9FB]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ ...sg, color:'#4F46E5' }}>By the numbers</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={sg}>A platform that delivers results</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center hover:shadow-lg hover:shadow-gray-100 transition-all group">
              <p className="text-4xl sm:text-5xl font-extrabold mb-2 group-hover:scale-110 transition-transform" style={{ ...sg, color: s.color }}>
                {s.value}
              </p>
              <p className="text-sm font-semibold text-gray-500" style={sg}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how" className="py-24 relative overflow-hidden" style={{ background: HERO }}>
      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(124,58,237,0.18)' }} />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background:'rgba(67,56,202,0.22)' }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ ...sg, color:'#a5b4fc' }}>Simple process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={sg}>How SkillBridge works</h2>
          <p className="text-indigo-200 text-lg max-w-xl mx-auto">From browsing to your first session in under 5 minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 relative">
          {/* Connector line — desktop */}
          <div className="hidden md:block absolute top-14 left-[calc(16.67%+3.5rem)] right-[calc(16.67%+3.5rem)] h-px" style={{ background:'rgba(165,180,252,0.25)' }} />

          {STEPS.map(({ num, Icon, title, desc, color }) => (
            <div key={num} className="relative rounded-2xl p-8 overflow-hidden group transition-all hover:-translate-y-1"
              style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', backdropFilter:'blur(8px)' }}>
              {/* Ghost step number */}
              <span className="absolute -bottom-2 right-4 text-8xl font-extrabold select-none pointer-events-none"
                style={{ ...sg, color:'rgba(255,255,255,0.04)' }}>{num}</span>

              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 group-hover:scale-110 transition-transform"
                style={{ background:`${color}28` }}>
                <Icon className="w-7 h-7" style={{ color }} />
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', ...sg }}>
                  Step {num}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3" style={sg}>{title}</h3>
              <p className="text-sm text-indigo-200 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedMentorsSection() {
  return (
    <section className="py-24 bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ ...sg, color:'#4F46E5' }}>Hand-picked</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={sg}>Meet some of our mentors</h2>
          </div>
          <Link to="/mentors"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            style={sg}>
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MENTORS.map(m => (
            <div key={m.name} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/60 hover:-translate-y-1 transition-all group">
              {/* Top banner */}
              <div className="h-20 relative" style={{ background: m.grad }}>
                <div className="absolute -bottom-6 left-5 w-14 h-14 rounded-2xl border-4 border-white flex items-center justify-center text-white text-base font-bold shadow-sm" style={{ background: m.grad }}>
                  {m.initials}
                </div>
              </div>

              <div className="pt-9 px-5 pb-5">
                <h3 className="font-bold text-gray-900 text-base leading-tight mb-0.5" style={sg}>{m.name}</h3>
                <p className="text-xs text-indigo-500 font-semibold mb-0.5">{m.role}</p>
                <p className="text-xs text-gray-400 mb-3">{m.company}</p>

                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-gray-900" style={sg}>{m.rating}</span>
                  <span className="text-xs text-gray-400">({m.reviews} reviews)</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {m.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400">from</p>
                    <p className="text-sm font-bold text-gray-900" style={sg}>LKR {m.rate.toLocaleString()}<span className="text-xs font-normal text-gray-400">/hr</span></p>
                  </div>
                  <Link to="/register"
                    className="px-4 py-1.5 text-xs font-bold text-white rounded-xl group-hover:shadow-md group-hover:shadow-indigo-200 transition-all"
                    style={{ background: BRAND }}>
                    Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/mentors" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600" style={sg}>
            View all mentors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const STUDENT_CARDS = [
  { Icon:Search,     title:'Smart Search',  desc:'Filter by skill, rate, or live availability',  from:'#4F46E5', to:'#6366F1' },
  { Icon:Shield,     title:'Verified',      desc:'Every mentor is reviewed and approved',         from:'#7C3AED', to:'#9333EA' },
  { Icon:Clock,      title:'Flexible',      desc:'Book sessions that fit your schedule',          from:'#0D9488', to:'#10B981' },
  { Icon:Award,      title:'Real Reviews',  desc:'Honest ratings from real students',             from:'#D97706', to:'#F59E0B' },
];

const MENTOR_CARDS = [
  { Icon:DollarSign, title:'Set Your Rate', desc:'You decide what your time is worth',            from:'#4F46E5', to:'#6366F1' },
  { Icon:Users,      title:'Your Audience', desc:'Students actively seeking your skills',         from:'#7C3AED', to:'#9333EA' },
  { Icon:BookOpen,   title:'Your Profile',  desc:'Showcase your experience and expertise',        from:'#0D9488', to:'#10B981' },
  { Icon:TrendingUp, title:'Track Growth',  desc:'See your impact with ratings and stats',        from:'#D97706', to:'#F59E0B' },
];

function DualValueSection() {
  const [tab, setTab] = useState('students');
  const isStudents = tab === 'students';

  return (
    <section id="mentors" className="py-24"
      style={DUAL_BG_IMAGE
        ? { backgroundImage:`url(${DUAL_BG_IMAGE})`, backgroundSize:'cover', backgroundPosition:'center' }
        : { background: 'white' }
      }>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ ...sg, color:'#4F46E5' }}>Built for everyone</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8" style={sg}>Who is SkillBridge for?</h2>

          <div className="inline-flex bg-gray-100 rounded-2xl p-1 gap-1">
            {[['students','For Students'],['mentors','For Mentors']].map(([key,label]) => (
              <button key={key} onClick={() => setTab(key)}
                className="px-6 py-2.5 text-sm font-bold rounded-xl transition-all"
                style={tab === key
                  ? { background: BRAND, color:'white', ...sg }
                  : { color:'#6B7280', ...sg }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Perks list */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3" style={sg}>
              {isStudents ? 'Unlock your full potential' : 'Share your expertise, earn on your terms'}
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {isStudents
                ? 'Get direct access to senior professionals who have built the skills you want to learn. No lectures — just real conversations that move you forward.'
                : 'Turn your experience into impact. Help the next generation of Sri Lankan tech talent while earning flexible income on your own schedule.'}
            </p>
            <ul className="space-y-3 mb-10">
              {(isStudents ? STUDENT_PERKS : MENTOR_PERKS).map(perk => (
                <li key={perk} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background:'rgba(79,70,229,0.1)' }}>
                    <Check className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-600">{perk}</span>
                </li>
              ))}
            </ul>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all"
              style={{ background: BRAND, ...sg }}>
              {isStudents ? 'Find my mentor' : 'Become a mentor'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4">
            {(isStudents ? STUDENT_CARDS : MENTOR_CARDS).map(({ Icon, title, desc, from, to }) => (
              <div key={title}
                className="rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                {/* Ghost icon watermark */}
                <Icon className="absolute -bottom-3 -right-3 w-20 h-20 opacity-[0.08] text-white pointer-events-none" />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 flex-shrink-0 bg-white/15 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-white mb-1" style={sg}>{title}</p>
                <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ ...sg, color:'#4F46E5' }}>Success stories</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={sg}>What students say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-7 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/60 hover:-translate-y-1 transition-all flex flex-col">
              <Quote className="w-8 h-8 text-indigo-100 mb-4" />
              <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">{t.text}</p>
              <div>
                <StarRow />
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: t.grad }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900" style={sg}>{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl overflow-hidden relative" style={{ background: HERO }}>
          {/* Glow effects */}
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background:'#7C3AED' }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ background:'#4338ca' }} />

          <div className="relative px-8 py-16 sm:py-20">
            <p className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-4" style={sg}>
              Your career is waiting
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight" style={sg}>
              Start your journey<br />today — it's free
            </h2>
            <p className="text-indigo-200 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join hundreds of students who are already learning from Sri Lanka's best mentors. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-indigo-700 bg-white rounded-2xl hover:bg-indigo-50 hover:shadow-xl transition-all"
                style={sg}>
                Create free account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/mentors"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white rounded-2xl border border-white/20 hover:bg-white/10 transition-all"
                style={sg}>
                Browse mentors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#F8F9FB] border-t border-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: BRAND }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg" style={sg}>SkillBridge</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Connecting ambitious students with Sri Lanka's best industry mentors.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4" style={sg}>Product</p>
            <ul className="space-y-3">
              {[['Browse Mentors','/mentors'],['How it Works','#how'],['Become a Mentor','/register'],['Sign In','/login']].map(([label, href]) => (
                <li key={label}>
                  {href.startsWith('#')
                    ? <a href={href} className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">{label}</a>
                    : <Link to={href}  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">{label}</Link>}
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4" style={sg}>Top Skills</p>
            <ul className="space-y-3">
              {['Software Engineering','Data Science','UI/UX Design','DevOps & Cloud','Product Management'].map(s => (
                <li key={s}>
                  <Link to={`/mentors?skill=${encodeURIComponent(s)}`} className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4" style={sg}>Company</p>
            <ul className="space-y-3">
              {['About','Blog','Careers','Privacy Policy','Terms of Service'].map(s => (
                <li key={s}><a href="#" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">{s}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">© 2025 SkillBridge. All rights reserved.</p>
          <p className="text-sm text-gray-400">Built in Sri Lanka 🇱🇰</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" style={sg}>
      <PublicNav />
      <main>
        <HeroSection />
        <TrustSection />
        <StatsSection />
        <HowItWorksSection />
        <FeaturedMentorsSection />
        <DualValueSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
