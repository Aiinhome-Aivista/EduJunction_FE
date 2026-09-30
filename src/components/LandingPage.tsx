import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PublicHeader } from './common/PublicHeader';
import { PublicFooter } from './common/PublicFooter';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Play,
  Brain,
  Target,
  Trophy,
  Users,
  BookOpen,
  BarChart3,
  MessageSquare,
  Gamepad2,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Lightbulb,
  Lock,
  Zap,
  TrendingUp,
  Loader2,
  Calendar,
  ShieldCheck,
  Flame,
  XCircle,
  FileText,
  Check,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import ApiServices from '../services/ApiServices';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onQuickDemo?: (role?: 'admin' | 'parent') => void;
}

type Role = 'student' | 'teacher' | 'parent';

const demoQuestions = {
  math: {
    subject: 'Mathematics',
    grade: 'Class 10 CBSE',
    chapter: 'Quadratic Equations',
    marks: 10,
    question:
      'A motorboat travels 24 km upstream and downstream. The upstream trip takes 1 hour more. Find the speed of the stream.',
    responses: [
      {
        label: 'Strong Attempt',
        tag: '10/10',
        score: 10,
        studentWork:
          'Let speed of stream = x km/h.\nUpstream = 18 − x, Downstream = 18 + x.\n24/(18 − x) − 24/(18 + x) = 1\nx² + 48x − 324 = 0\nx = 6 km/h.',
        feedback:
          'Excellent step-by-step reasoning. The equation, algebra and final constraint are correct.',
        breakdown: [
          ['Define variables', '2/2', true],
          ['Set up time equation', '3/3', true],
          ['Form quadratic', '3/3', true],
          ['Validate the answer', '2/2', true],
        ],
      },
      {
        label: 'Needs Help',
        tag: '7/10',
        score: 7,
        studentWork:
          'Let speed of stream = x km/h.\nUpstream = 18 − x, Downstream = 18 + x.\n24/(18 − x) − 24/(18 + x) = 1\nx² + 48x + 324 = 0\nGot negative roots.',
        feedback:
          'A sign error appeared while moving a term across the equation. The next learning step focuses on transposition.',
        breakdown: [
          ['Define variables', '2/2', true],
          ['Set up time equation', '3/3', true],
          ['Form quadratic', '1/3', false],
          ['Validate the answer', '1/2', false],
        ],
      },
    ],
  },
  science: {
    subject: 'Science',
    grade: 'Class 8',
    chapter: 'Cell Structure & Functions',
    marks: 10,
    question:
      'Give three differences between plant and animal cells and explain why plant cells need a cell wall.',
    responses: [
      {
        label: 'Model Answer',
        tag: '10/10',
        score: 10,
        studentWork:
          'Plant cells have a cell wall, plastids and a large central vacuole.\nAnimal cells do not have a cell wall or plastids and usually have smaller vacuoles.\nThe cell wall gives plant cells support and protection.',
        feedback:
          'Clear comparison with accurate reasoning and good use of scientific terms.',
        breakdown: [
          ['Cell wall difference', '2/2', true],
          ['Plastid difference', '2/2', true],
          ['Vacuole difference', '2/2', true],
          ['Explain the reason', '4/4', true],
        ],
      },
    ],
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onQuickDemo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] =
    useState<keyof typeof demoQuestions>('math');
  const [selectedAttempt, setSelectedAttempt] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeRole, setActiveRole] = useState<Role>('student');
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(true);
  const [freeMockBoard, setFreeMockBoard] = useState<string>('CBSE');
  const [freeMockClass, setFreeMockClass] = useState<string>('Class 10');
  const [freeMockSubject, setFreeMockSubject] = useState<string>('Mathematics');
  const [isGeneratingMock, setIsGeneratingMock] = useState<boolean>(false);
  const [mockSuccessMsg, setMockSuccessMsg] = useState<string | null>(null);

  const handleStartFreeMock = async () => {
    try {
      setIsGeneratingMock(true);
      setMockSuccessMsg(null);
      const res = await ApiServices.generateFreeMockTest({
        board: freeMockBoard,
        classGrade: freeMockClass,
        subject: freeMockSubject,
      });
      if (res?.exam) {
        localStorage.setItem('pending_free_exam', JSON.stringify(res.exam));
        setMockSuccessMsg(
          `🎉 Free 10-Mark Mock Test generated for ${freeMockBoard} ${freeMockClass} ${freeMockSubject}!`
        );
        setTimeout(() => {
          openAuth('login');
        }, 1000);
      }
    } catch (err: any) {
      openAuth('login');
    } finally {
      setIsGeneratingMock(false);
    }
  };

  // Scroll Reveal Animation Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);



  const openAuth = (mode: 'login' | 'register' = 'login') => {
    onOpenAuth(mode);
  };

  const location = useLocation();
  const navigate = useNavigate();
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      const isReload = (() => {
        try {
          const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
          if (navEntries && navEntries.length > 0) {
            return navEntries[0].type === 'reload';
          }
          return (performance as any)?.navigation?.type === 1;
        } catch {
          return false;
        }
      })();

      if (isReload) {
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'manual';
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (location.pathname !== '/' && location.pathname !== '/home' && location.pathname !== '/landing') {
          navigate('/home', { replace: true });
          return;
        }
      }
    }

    if (location.search.includes('auth=login')) {
      openAuth('login');
      navigate('/', { replace: true });
      return;
    } else if (location.search.includes('auth=register')) {
      openAuth('register');
      navigate('/', { replace: true });
      return;
    }

    const pathId = location.pathname.substring(1).split('/')[0];
    const hashTarget = location.hash ? location.hash.replace('#', '') : null;
    let targetId = hashTarget || pathId;
    if (targetId === 'roles') targetId = 'for-everyone';

    if (targetId && targetId !== 'landing' && targetId !== 'hero' && targetId !== 'home' && targetId !== '') {
      const scrollToEl = () => {
        const el = document.getElementById(targetId) || (targetId === 'for-everyone' ? document.getElementById('roles') : null);
        if (el) {
          const header = document.querySelector('header');
          const headerHeight = header ? header.getBoundingClientRect().height : 72;
          const y = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        }
      };
      const scrollTimer = setTimeout(scrollToEl, 60);
      return () => clearTimeout(scrollTimer);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash, location.search, navigate]);

  const runDemo = (subject: keyof typeof demoQuestions) => {
    setSelectedSubject(subject);
    setSelectedAttempt(0);
    setIsEvaluating(true);
    window.setTimeout(() => setIsEvaluating(false), 450);
  };

  const currentQuestion = demoQuestions[selectedSubject];
  const currentAttempt =
    currentQuestion.responses[selectedAttempt] ||
    currentQuestion.responses[0];

  const faqs = [
    {
      q: 'How does the personalized learning Path work?',
      a: 'The platform studies assessment performance, finds strong and weak topics, and recommends the next lesson, practice set or challenge. The Path changes as the student improves.',
    },
    {
      q: 'What happens after a student makes mistakes?',
      a: 'The system identifies the topic or mistake pattern and recommends focused learning resources, practice questions and, when appropriate, another mini-test.',
    },
    {
      q: 'What do advanced students receive?',
      a: 'Students who consistently perform well can move to harder questions, HOTS (Higher Order Thinking Skills) practice, challenge quizzes and advanced mock exams instead of repeating basic content.',
    },
    {
      q: 'Can parents and teachers see progress?',
      a: 'Yes. Authorized parents and teachers can view relevant progress, reports, strengths and improvement areas, and communicate securely about the learning journey.',
    },
    {
      q: 'Is learning only about tests?',
      a: 'No. The platform combines assessment, personalized learning, practice, rewards, simple educational games and short fun moments to keep children engaged.',
    },
  ];

  const roleContent = {
    student: {
      title: 'For Students',
      subtitle: 'Learn at your own pace.',
      icon: GraduationCap,
      bullets: [
        'Personalized learning Path',
        'Practice and mock tests',
        'Points, badges and streaks',
        'Fun games and brain breaks',
      ],
    },
    teacher: {
      title: 'Your Study Buddy',
      subtitle: 'The smartest virtual teacher around.',
      icon: BookOpen,
      bullets: [
        'Instant step-by-step guidance',
        'Finds weak spots in seconds',
        'Recommends the best next lesson',
        'Available 24/7 for support',
      ],
    },
    parent: {
      title: 'For Parents',
      subtitle: "Stay connected with your child's progress.",
      icon: Users,
      bullets: [
        'Progress and performance reports',
        'Strength and weakness insights',
        'Secure teacher communication',
        'Support learning at home',
      ],
    },
  };

  // Simple Word Builder Game State & Logic (For 5th Class Students)
  const EASY_WORDS = [
    {
      word: 'SOLAR',
      logo: '☀️',
      hint: 'It shines bright in the sky!',
      mascotMsg: 'Hey Little Explorer! Can you build the word for Sun Power?',
      secretHint: 'Starts with S... It creates clean energy from sunlight!',
      gradient: 'from-amber-400 via-orange-400 to-yellow-500',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    {
      word: 'EARTH',
      logo: '🌍',
      hint: 'Our beautiful home planet!',
      mascotMsg: 'We all live here! Can you spell our home planet?',
      secretHint: 'Starts with E... It has oceans, trees, and air to breathe!',
      gradient: 'from-emerald-400 via-teal-500 to-green-500',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    // {
    //   word: 'ROBOT',
    //   logo: '🤖',
    //   hint: 'Beep-boop! A smart helper machine!',
    //   mascotMsg: 'Beep Boop! Spell the word for a smart metal helper!',
    //   secretHint: 'Starts with R... It works on electricity and code!',
    //   gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    //   badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-300'
    // },
    {
      word: 'GRAVITY',
      logo: '🍏',
      hint: 'Invisible force pulling everything down!',
      mascotMsg: 'Why do objects fall down and not float up? Spell the magic force!',
      secretHint: 'Starts with G... Sir Isaac Newton discovered it with an apple!',
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      word: 'SPACE',
      logo: '🚀',
      hint: 'Full of moon and glowing stars!',
      mascotMsg: 'Ready for a rocket trip? Build the word for the universe!',
      secretHint: 'Starts with S... It is dark, quiet, and full of stars!',
      gradient: 'from-purple-500 via-pink-500 to-indigo-600',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-300'
    },
    {
      word: 'BRAIN',
      logo: '🧠',
      hint: 'Your super-smart thinking cap!',
      mascotMsg: 'Use your thinking cap to spell this super-computer body part!',
      secretHint: 'Starts with B... It helps you learn, dream, and play!',
      gradient: 'from-rose-400 via-pink-500 to-red-500',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300'
    },
  ];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [isWordComplete, setIsWordComplete] = useState(false);
  const [showSecretHint, setShowSecretHint] = useState(false);

  const activeWordObj = EASY_WORDS[currentWordIndex];

  const loadWord = (index: number) => {
    const word = EASY_WORDS[index].word;
    setUserLetters([]);
    setIsWordComplete(false);
    setShowSecretHint(false);

    const lettersArr = word.split('');
    const extraLetters = ['X', 'Z', 'M', 'K', 'L', 'P'];
    const combined = [...lettersArr, extraLetters[Math.floor(Math.random() * extraLetters.length)]];

    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    setShuffledOptions(combined);
  };

  useEffect(() => {
    loadWord(currentWordIndex);
  }, [currentWordIndex]);

  const handleLetterClick = (letter: string) => {
    if (isWordComplete) return;

    const targetWord = activeWordObj.word;
    const nextIndex = userLetters.length;

    if (targetWord[nextIndex] === letter) {
      const updated = [...userLetters, letter];
      setUserLetters(updated);

      if (updated.length === targetWord.length) {
        setIsWordComplete(true);
      }
    }
  };

  const nextWord = () => {
    const nextIdx = (currentWordIndex + 1) % EASY_WORDS.length;
    setCurrentWordIndex(nextIdx);
  };

  const resetCurrentWord = () => {
    loadWord(currentWordIndex);
  };

  const [activeFeatureModal, setActiveFeatureModal] = useState<string | null>(null);
  const [demoMcqSelected, setDemoMcqSelected] = useState<number | null>(null);
  const [demoBadgeClaimed, setDemoBadgeClaimed] = useState<boolean>(false);

  const supportComposeUrl = 'https://mail.google.com/mail/u/0/?fs=1&to=support@edujunction.co.in&tf=cm';
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-clip">
      <style>{`
        html {
          scroll-padding-top: 140px;
          scroll-behavior: smooth;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        @keyframes float-3d {
          0%, 100% {
            transform: translateY(0px) rotateY(-3deg) rotateX(2deg);
          }
          50% {
            transform: translateY(-12px) rotateY(3deg) rotateX(-2deg);
          }
        }
        .animate-float-3d {
          animation: float-3d 6s ease-in-out infinite;
        }
      `}</style>
      {/* FIXED NAVBAR & MARQUEE TICKER (Guaranteed 100% Viewport Locking) */}
      <div className="fixed top-0 left-0 right-0 z-50 shadow-sm bg-white">
        <PublicHeader onOpenAuth={openAuth} />
        <div className="w-full overflow-hidden relative py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-b border-amber-600/30 shadow-xs select-none">
          <div
            className="flex items-center whitespace-nowrap w-max"
            style={{ animation: 'navMarquee 80s linear infinite' }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span key={i} className="flex items-center gap-3 pr-12">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-950 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
                  <span>{i % 2 === 0 ? "✨" : "🎯"}</span> {i % 2 === 0 ? "NEW" : "TIPS"}
                </span>
                <span className="text-stone-950 font-black text-sm sm:text-base tracking-wide drop-shadow-sm">
                  {i % 2 === 0 ? (
                    <>
                      Model Test Papers Available for <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">CBSE</span>, <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">ICSE</span> &amp; <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">ISC</span> Boards
                    </>
                  ) : (
                    <>
                      Practice smart. Prepare better.
                    </>
                  )}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* HERO SECTION (Padded for Fixed Header Height) */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-stone-50 pt-28 sm:pt-32"
      >

        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute top-40 -left-32 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-4 sm:pb-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-yellow-200 text-yellow-700 text-xs font-bold shadow-sm">
                Study Buddy-powered learning for students, teachers & parents
              </div>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight capitalize">
                Learn Smarter.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-500">
                  Grow Better.
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl text-justify [text-align-last:left]">
                Take an assessment, understand where you need help, and get a
                learning Path made for you. Learn, practice, play and improve
                with your Study Buddy.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => openAuth('register')}
                  className="px-7 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-stone-950 font-extrabold shadow-xl shadow-yellow-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Get Started For FREE <ArrowRight className="w-5 h-5" />
                </button>
                <Link
                  to="/how-it-works"
                  className="px-7 py-3.5 rounded-2xl bg-white border border-stone-200 hover:border-yellow-300 text-stone-800 font-bold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  See How It Works
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-3 text-xs font-bold text-stone-600">
                {['Assess', 'Analyze', 'Learn', 'Improve'].map((item, i) => (
                  <React.Fragment key={item}>
                    <span className="px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-300 text-yellow-800 shadow-sm shadow-yellow-100/50">
                      {i + 1}. {item}
                    </span>
                    {i < 3 && <ArrowRight className="w-3.5 self-center text-yellow-400" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* HERO RIGHT IMAGE */}
            <div className="relative flex justify-center lg:justify-end">
              <style>{`
                @keyframes float-animation {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-20px); }
                  100% { transform: translateY(0px); }
                }
                @keyframes float-delayed {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-15px); }
                  100% { transform: translateY(0px); }
                }
                .animate-float-hero {
                  animation: float-animation 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                  animation: float-delayed 7s ease-in-out infinite 1s;
                }
                .animate-float-slow {
                  animation: float-animation 8s ease-in-out infinite 2s;
                }
              `}</style>

              <div className="absolute top-10 -left-10 text-4xl opacity-50 animate-float-delayed select-none pointer-events-none">✨</div>
              <div className="absolute bottom-20 -left-5 text-3xl opacity-50 animate-float-slow select-none pointer-events-none">🌟</div>
              <div className="absolute top-20 right-0 text-3xl opacity-40 animate-float-delayed select-none pointer-events-none">💡</div>
              <div className="absolute bottom-10 right-10 text-4xl opacity-50 animate-float-slow select-none pointer-events-none">🎨</div>
              <img
                src="/hero-illustration.png"
                alt="Animated Hero Illustration"
                className="w-full max-w-[550px] object-contain animate-float-hero filter drop-shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* WAVY DIVIDER at bottom of Hero */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 translate-y-[99%]">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-6 sm:h-10 fill-yellow-50/50">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C101.33,26.6,204.66,66.19,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* QUICK VALUE */}
      <section className="bg-yellow-50/50 relative pt-2 sm:pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              ['📝', 'Assess', 'Find what you know'],
              ['🤖', 'Study Buddy Insights', 'Find where you need help'],
              ['🎯', 'Personal Path', 'Get the right next step'],
              ['🏆', 'Rewards', 'Stay motivated'],
            ].map(([icon, title, text], idx) => (
              <div key={title} className="flex items-center gap-4 reveal-on-scroll" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm shadow-yellow-100 border border-yellow-200 flex items-center justify-center text-2xl shrink-0">{icon}</div>
                <div>
                  <div className="font-extrabold text-sm text-stone-900">{title}</div>
                  <div className="text-xs font-medium text-stone-600 mt-0.5">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="pt-4 sm:pt-6 pb-6 bg-stone-50 scroll-mt-[90px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100/80 text-yellow-800 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-600 animate-pulse" />
              What You Can Do
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight capitalize">
              Everything you need to learn better
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              Simple tools for learning, practice, motivation and communication.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                id: 'smart-assessment',
                icon: Target,
                title: 'Smart Assessment',
                subtitle: 'Adaptive diagnostic testing calibrated to ICSE & CBSE standards',
                text: 'Take short assessments that show exactly which topics need attention.',
                bg: 'bg-amber-100/70',
                fg: 'text-amber-700',
                hoverBorder: 'hover:border-amber-300',
                highlights: [
                  'Chapter-wise diagnostic quizzes (5-10 mins)',
                  'Step-by-step marking scheme aligned to CBSE/ICSE blueprint',
                  'Instant auto-grading with explanation for wrong answers',
                  'Detects speed vs accuracy bottlenecks'
                ]
              },
              {
                id: 'study-buddy',
                icon: Brain,
                title: 'Study Buddy Insights',
                subtitle: 'mentor analyzing student learning behavior and common traps',
                text: 'Study Buddy finds strengths, weak areas and common mistake patterns.',
                bg: 'bg-yellow-100/70',
                fg: 'text-yellow-700',
                hoverBorder: 'hover:border-yellow-300',
                highlights: [
                  'Identifies misconception patterns before exam day',
                  'Recommends targeted concept revision sheets',
                  'Tracks prerequisite gaps across previous classes',
                  'Personalized  study scheduler'
                ]
              },
              {
                id: 'personalized',
                icon: TrendingUp,
                title: 'Personalized Learning',
                subtitle: 'Dynamic learning roadmap that scales with student performance',
                text: 'Get lessons, resources and practice based on your current level.',
                bg: 'bg-orange-100/70',
                fg: 'text-orange-700',
                hoverBorder: 'hover:border-orange-300',
                highlights: [
                  '3-Tier Difficulty Calibration (Simple, Medium, Hard/HOTS)',
                  'Automatic remediation exercises for weak topics',
                  'Custom paper generator tailored to board syllabus',
                  'Adaptive revision speed adjustments'
                ]
              },
              {
                id: 'points-badges',
                icon: Trophy,
                title: 'Points & Badges',
                subtitle: 'Gamified rewards system to keep students engaged every day',
                text: 'Earn points for correct answers and badges for milestones.',
                bg: 'bg-emerald-100/70',
                fg: 'text-emerald-700',
                hoverBorder: 'hover:border-emerald-300',
                highlights: [
                  'Earn XP points for quiz completions and accuracy',
                  'Unlock badges like "Math Wizard", "Formula Champ", "Streak Master"',
                  'Daily learning streak multiplier bonus',
                  'Friendly leaderboards for peer motivation'
                ]
              },
              {
                id: 'progress-tracking',
                icon: BarChart3,
                title: 'Progress Tracking',
                subtitle: 'Visual analytics dashboard for students, teachers, and parents',
                text: 'See scores, topic mastery, streaks and improvement over time.',
                bg: 'bg-sky-100/70',
                fg: 'text-sky-700',
                hoverBorder: 'hover:border-sky-300',
                highlights: [
                  'Real-time accuracy & speed progress charts',
                  'Chapter-by-chapter mastery percentages',
                  'Historical exam score trend analysis',
                  'Exportable PDF performance dossiers'
                ]
              },
              {
                id: 'parent-teacher',
                icon: MessageSquare,
                title: 'Parent-Teacher Connect',
                subtitle: 'Seamless parent notifications & automated email/PDF report dispatch',
                text: 'Share progress and communicate securely about the student.',
                bg: 'bg-rose-100/70',
                fg: 'text-rose-700',
                hoverBorder: 'hover:border-rose-300',
                highlights: [
                  'Automated PDF exam report sent directly to parent email',
                  'Parent dashboard link for child activity monitoring',
                  'Teacher note & feedback attachment support',
                  'WhatsApp performance alerts'
                ]
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  onClick={() => {
                    setActiveFeatureModal(feature.id);
                    setDemoMcqSelected(null);
                  }}
                  className={`group bg-white rounded-2xl border border-stone-200/80 p-5 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-stone-200/80 transition-all duration-300 reveal-on-scroll cursor-pointer relative overflow-hidden ${feature.hoverBorder}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${feature.bg} ${feature.fg} flex items-center justify-center shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-black text-stone-800 text-base leading-snug group-hover:text-amber-600 transition-colors">
                        {feature.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-900 transition-all">
                      Preview ↗
                    </span>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── INTERACTIVE FEATURE PREVIEW MODAL ── */}
          {activeFeatureModal && (() => {
            const featuresMap: Record<string, any> = {
              'smart-assessment': {
                icon: Target,
                title: 'Smart Assessment',
                badge: 'Assessment Engine',
                badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
                subtitle: 'Adaptive ICSE & CBSE Diagnostic Test Engine',
                description: 'Smart Assessment automatically analyzes student response patterns, evaluates step-by-step logic, and pinpoints conceptual gaps in real time.',
                highlights: [
                  'Automatic Board Alignment (CBSE, ICSE & ISC 2027 Blueprint)',
                  'Real-time Stopwatch & Speed vs Accuracy Tracking',
                  'Instant Model Answers & Step-by-Step Marking Rules',
                  'Targeted Revision Recommendations after every submission'
                ],
                demoTitle: 'Interactive Live Preview: MCQ Diagnostic',
                demoWidget: (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>Class 10 Physics • Current Electricity</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px]">1 Mark</span>
                    </div>
                    <p className="text-xs font-black text-stone-800">
                      Q: What happens to the resistance of a conductor if its length is doubled and radius is halved?
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      {[
                        { label: 'A) Remains unchanged', correct: false },
                        { label: 'B) Increases 4 times', correct: false },
                        { label: 'C) Increases 8 times', correct: true },
                        { label: 'D) Decreases to half', correct: false }
                      ].map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setDemoMcqSelected(idx)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            demoMcqSelected === idx
                              ? opt.correct
                                ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                                : 'bg-rose-100 border-rose-400 text-rose-900 font-bold'
                              : 'bg-white border-stone-200 hover:border-amber-300 text-stone-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {demoMcqSelected !== null && (
                      <div className={`p-3 rounded-xl text-xs ${demoMcqSelected === 2 ? 'bg-emerald-100/90 text-emerald-900' : 'bg-amber-100 text-amber-900'} font-medium animate-fade-in`}>
                        {demoMcqSelected === 2 ? (
                          <span>✨ <strong>Correct!</strong> R = ρ * (2L) / π(r/2)² = 8 * R_initial. Resistance increases 8 times.</span>
                        ) : (
                          <span>💡 <strong>Tip:</strong> R = ρ * L / A. When radius is halved, area becomes 1/4th. Try Option C!</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              },
              'study-buddy': {
                icon: Brain,
                title: 'Study Buddy Insights',
                badge: ' Mentor Insights',
                badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
                subtitle: 'Personalized  Learning Companion & Mistake Detector',
                description: 'Study Buddy acts as a 24/7 personal tutor that finds root causes of mistakes, recommends remedial practice, and builds long-term memory.',
                highlights: [
                  'Pinpoints common exam traps and formula calculation slips',
                  'Builds personalized revision Flashcards and Mind Maps',
                  'Reminds students to review prerequisite topics before new chapters',
                  'Natural language doubt clarification in plain English & Bengali'
                ],
                demoTitle: 'Live Insights Dashboard Preview',
                demoWidget: (
                  <div className="p-4 rounded-2xl bg-yellow-50/70 border border-yellow-200/80 space-y-3 text-xs">
                    <div className="flex items-center justify-between font-black text-stone-800">
                      <span>🤖 Study Buddy Misconception Radar</span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">Active Analysis</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200 space-y-1">
                        <div className="flex justify-between font-bold text-stone-800">
                          <span>⚠️ Trait Identified: Sign Convention in Optics</span>
                          <span className="text-amber-600 font-black">72% Risk</span>
                        </div>
                        <p className="text-[11px] text-stone-600">You tend to confuse mirror formula negative sign with lens formula positive sign.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                        <div className="flex justify-between font-bold text-emerald-900">
                          <span>✨ Recommended Action</span>
                          <span className="text-emerald-700 font-bold">5 Min Practice</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">Complete 3 targeted lens formula numericals to eliminate this trap permanently.</p>
                      </div>
                    </div>
                  </div>
                )
              },
              'personalized': {
                icon: TrendingUp,
                title: 'Personalized Learning',
                subtitle: 'Adaptive Roadmap Aligned to Board Syllabus',
                text: 'Tailored study speed, difficulty levels, and step-by-step guidance.',
                badge: 'Adaptive Path',
                badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
                description: 'Every student gets a unique learning pathway. If a student masters basic concepts quickly, difficulty automatically scales up to HOTS (High Order Thinking Skills).',
                highlights: [
                  '3-Tier Difficulty Scaling: Simple (Foundational), Medium (Standard), Hard (HOTS)',
                  'Dynamic Question Bank selection based on target board (ICSE / CBSE / ISC)',
                  'Custom mock test creation by selecting preferred chapters',
                  'Saves time by skipping already mastered topics'
                ],
                demoTitle: 'Adaptive Progression Pathway',
                demoWidget: (
                  <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-3 text-xs">
                    <div className="font-black text-stone-800 flex justify-between items-center">
                      <span>🚀 Class 10 Math Roadmap</span>
                      <span className="text-orange-700 font-bold">Level 3 Unlocked</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">✓</div>
                        <div>
                          <div className="font-bold text-stone-800 text-[11px]">Level 1: Foundational Definitions</div>
                          <div className="text-[10px] text-stone-500">Mastered (100% Accuracy)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">✓</div>
                        <div>
                          <div className="font-bold text-stone-800 text-[11px]">Level 2: Standard Formula Application</div>
                          <div className="text-[10px] text-stone-500">Mastered (94% Accuracy)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-amber-100 rounded-xl border border-amber-300">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">🔥</div>
                        <div>
                          <div className="font-bold text-amber-950 text-[11px]">Level 3: Board HOTS & Traps (Current)</div>
                          <div className="text-[10px] text-amber-800">Active Challenge Set</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              },
              'points-badges': {
                icon: Trophy,
                title: 'Points & Badges',
                subtitle: 'Gamified Motivation Engine & Achievement Showcase',
                badge: 'Gamified XP System',
                badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                description: 'Turn study sessions into an exciting journey. Students earn XP points, daily streak multipliers, and unlock authentic academic badges as they master subjects.',
                highlights: [
                  'XP Rewards for correct answers, daily streaks, and full test completions',
                  'Unlockable badges: "Math Wizard", "Optics Scholar", "Streak Master"',
                  'Level up from Novice Learner to National Board Scholar',
                  'Safe, positive peer encouragement'
                ],
                demoTitle: 'Student Achievement Badge Showcase',
                demoWidget: (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3 text-xs">
                    <div className="flex justify-between items-center font-black text-emerald-950">
                      <span>🏆 Level 4 Board Scholar (850 / 1000 XP)</span>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">🔥 7 Day Streak</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[85%] rounded-full transition-all duration-500"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 flex flex-col items-center">
                        <span className="text-xl">🧙‍♂️</span>
                        <span className="font-bold text-[10px] text-stone-800 mt-1">Math Wizard</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 flex flex-col items-center">
                        <span className="text-xl">⚡</span>
                        <span className="font-bold text-[10px] text-stone-800 mt-1">Streak Master</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 flex flex-col items-center">
                        <span className="text-xl">📜</span>
                        <span className="font-bold text-[10px] text-stone-800 mt-1">Formula Champ</span>
                      </div>
                    </div>
                  </div>
                )
              },
              'progress-tracking': {
                icon: BarChart3,
                title: 'Progress Tracking',
                subtitle: 'Real-Time Performance Analytics & Mastery Graphs',
                badge: 'Real-Time Analytics',
                badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
                description: 'Comprehensive dashboard presenting accuracy percentages, speed trends, chapter completion rates, and historical performance graphs.',
                highlights: [
                  'Subject-wise accuracy breakdown (Mathematics, Physics, Chemistry, Biology)',
                  'Weekly test score improvement trend tracking',
                  'Time spent per question metrics to eliminate test anxiety',
                  'Instant downloadable PDF progress dossiers'
                ],
                demoTitle: 'Analytics Performance Preview',
                demoWidget: (
                  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-3 text-xs">
                    <div className="flex justify-between items-center font-black text-sky-950">
                      <span>📊 Subject Mastery Breakdown</span>
                      <span className="text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full">+14% Score Increase</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between font-bold text-stone-700 text-[11px] mb-1">
                          <span>Mathematics (Class 10)</span>
                          <span>92% Accuracy</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full w-[92%]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold text-stone-700 text-[11px] mb-1">
                          <span>Physics (Class 10)</span>
                          <span>86% Accuracy</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2">
                          <div className="bg-sky-500 h-2 rounded-full w-[86%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              },
              'parent-teacher': {
                icon: MessageSquare,
                title: 'Parent-Teacher Connect',
                subtitle: 'Automated Parent Email/PDF Reports & Communication',
                badge: 'Parent Notification',
                badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
                description: 'Keep parents informed without manual hassle. Detailed PDF exam reports are generated and automatically emailed to registered parents after test completion.',
                highlights: [
                  'Automatic PDF report emailed to parents after every full mock test',
                  'Detailed report includes score, strengths, weak topics, and teacher notes',
                  'Dedicated Parent Portal view to track child activity securely',
                  'Instant WhatsApp performance summary alerts'
                ],
                demoTitle: 'Parent Email PDF Notification Preview',
                demoWidget: (
                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 font-black text-rose-950">
                      <span className="p-1 rounded bg-rose-200 text-rose-800">📄</span>
                      <span>Automated Parent Email Report</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1.5 text-[11px]">
                      <div className="flex justify-between font-bold text-stone-800">
                        <span>To: parent@edujunction.co.in</span>
                        <span className="text-emerald-600">✓ Delivered</span>
                      </div>
                      <p className="text-stone-600">
                        "Dear Parent, your child completed <strong>ICSE Class 10 Physics Model Paper 1</strong> with <strong>88% score</strong>. Detailed PDF report is attached."
                      </p>
                      <div className="pt-1 flex items-center justify-between font-bold text-amber-700">
                        <span>📎 Attached: Exam_Report_ICSE10_Physics.pdf</span>
                        <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">Ready</span>
                      </div>
                    </div>
                  </div>
                )
              }
            };

            const featData = featuresMap[activeFeatureModal];
            if (!featData) return null;
            const ModalIcon = featData.icon;

            return (
              <div
                onClick={() => setActiveFeatureModal(null)}
                className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-full max-w-2xl sm:max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
                >
                  {/* Header */}
                  <div className="p-4 sm:p-5 border-b border-stone-100 bg-gradient-to-r from-yellow-50 via-amber-50 to-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-md shadow-yellow-200 shrink-0">
                        <ModalIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-stone-900">{featData.title}</h3>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${featData.badgeColor}`}>
                            {featData.badge}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-stone-600 mt-0.5">{featData.subtitle}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveFeatureModal(null)}
                      className="p-2 rounded-xl hover:bg-stone-200/60 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
                    <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed text-justify [text-align-last:left]">
                      {featData.description}
                    </p>

                    {/* Highlights Grid */}
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] sm:text-xs font-black text-stone-900 uppercase tracking-wider">Key Feature Highlights:</h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {featData.highlights.map((h: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] sm:text-xs font-semibold text-stone-800">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Demo Widget */}
                    {featData.demoWidget && (
                      <div className="space-y-1.5 pt-2 border-t border-stone-100">
                        <h4 className="text-[11px] sm:text-xs font-black text-stone-900 uppercase tracking-wider">{featData.demoTitle}:</h4>
                        {featData.demoWidget}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 💎 WHY EDUJUNCTION (EDITORIAL STORY & VALUE NARRATIVE) */}
      <section id="why-edujunction" className="pt-4 sm:pt-6 pb-16 sm:pb-20 bg-white border-b border-stone-200/70 relative overflow-hidden scroll-mt-[90px]">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-yellow-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Why EduJunction
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
              Edu<span className="text-yellow-500">Junction</span> vs <span className="text-yellow-500">Others</span>
            </h2>
          </div>

          {/* 2-Column Open / Borderless Layout: Left Description & Right 3D Motion Image */}
          <div className="mt-12 lg:mt-16 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center reveal-on-scroll">
            {/* Left Side: Description */}
            <div className="lg:col-span-6 space-y-4">
              <p className="text-stone-600 text-base sm:text-lg lg:text-[17.5px] leading-relaxed sm:leading-[1.85] text-justify [text-align-last:left]">
                While traditional platforms offer generic PDFs with zero diagnostic insights, <strong className="text-stone-900 font-bold">EduJunction</strong> brings the exact <strong className="text-amber-800 font-bold">Upcoming ICSE, ISC &amp; CBSE board blueprints</strong> to life with step-by-step scoring rubrics. Our built-in <strong className="text-stone-900 font-bold">Study Buddy</strong> identifies why a student struggled, pinpointing conceptual traps and prerequisite knowledge gaps before exam day.
              </p>
              <p className="text-stone-600 text-base sm:text-lg lg:text-[17.5px] leading-relaxed sm:leading-[1.85] text-justify [text-align-last:left]">
                Every test submission automatically compiles and emails an authentic <strong className="text-stone-900 font-bold">PDF Diagnostic Dossier</strong> directly to parents with chapter-wise mastery breakdowns, ensuring seamless transparency. Inside the exam interface, students can solve numericals, draft diagrams, and utilize digital scratchpads directly with our <strong className="text-stone-900 font-bold">Interactive STEM Canvas</strong>. We believe quality education should be accessible and student-centric — empowering learners with <strong className="text-amber-800 font-bold">fair, modular, per-paper pricing</strong> and absolutely no forced annual lock-ins, putting students in complete control of their success.
              </p>
            </div>

            {/* Right Side: 3D Motion Image (Round & Larger) */}
            <div className="lg:col-span-6 flex items-center justify-center [perspective:1200px]">
              <div className="relative group animate-float-3d [transform-style:preserve-3d] w-full max-w-[460px] sm:max-w-[500px]">
                {/* 3D Background Glow & Gradient Aura */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/30 via-yellow-400/35 to-amber-500/30 rounded-full blur-3xl opacity-80 group-hover:opacity-100 transition duration-700 pointer-events-none" />

                {/* 3D Elevated Round Image Frame */}
                <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-2xl shadow-amber-950/20 border-4 border-white/90 bg-amber-50/50 transition-transform duration-700 ease-out group-hover:[transform:rotateY(-8deg)_rotateX(6deg)_scale(1.04)] flex items-center justify-center">
                  <img
                    src="/why-edujunction-student.png"
                    alt="Student studying with EduJunction"
                    className="w-full h-full object-cover object-[center_35%]"
                    loading="lazy"
                  />
                  {/* Subtle 3D Glass Light Reflection */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/15 to-white/35 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 MODEL TEST PAPERS 2027 & FREE MOCK TEST BANNER */}
      <section id="model-papers-2027" className="pt-4 sm:pt-6 pb-12 sm:pb-14 bg-gradient-to-br from-amber-50/70 via-yellow-50/40 to-white border-y border-amber-200/70 relative overflow-hidden scroll-mt-[90px]">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-yellow-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100/90 border border-yellow-200 text-yellow-800 text-xs font-bold shadow-sm">
              <FileText className="w-3.5 h-3.5 text-yellow-600 animate-pulse" />
              Model Test Papers 2027
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize tracking-tight text-stone-900">
              Board Exam Preparation &amp; Mock Tests
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base font-medium">
              Curated specimen papers and instant diagnostic tests designed for ICSE, CBSE &amp; ISC board exam readiness.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            {/* 1. Model Test Papers - ICSE, CBSE & ISC 2027 Announcement Banner */}
            <div className="rounded-3xl bg-white border border-amber-300/80 p-6 sm:p-7 shadow-lg shadow-amber-500/5 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl hover:border-amber-400 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Available Now
                  </div>
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  Model Test Papers :{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">
                    ICSE, CBSE &amp; ISC 2027
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium text-justify [text-align-last:left]">
                  Access full-length authentic specimen model papers: <b>CBSE (3h • 80m)</b>, <b>ICSE (2.5h • 80m)</b> and <b>ISC (3h • 70/80m)</b>. Built on 10–15 years of past question patterns and step-by-step marking rubrics.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    '⏱️ CBSE: 3 Hours (80 Marks)',
                    '⏱️ ICSE: 2.5 Hours (80 Marks)',
                    '⏱️ ISC: 3 Hours (70/80 Marks)',
                    '📄 PDF & Word Downloads',
                    '10–15 Yrs Past Trends (2011–2026)',
                    '🎯 Step-by-Step Marking Rules',
                  ].map((tag) => (
                    <div key={tag} className="px-2.5 py-1.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-stone-700 text-[11px] font-bold flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span> {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => openAuth('register')}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 font-black text-xs shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                >
                  Explore Model Papers <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Free Mock Test: Subject-Wise 10-Mark Diagnostic Mock Test Available */}
            <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white p-6 sm:p-7 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-stone-950 text-xs font-black">
                    <Zap className="w-3.5 h-3.5 fill-current" /> Free Mock Test Available
                  </div>
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Free Subject-Wise 10-Mark Mock Test
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed text-justify [text-align-last:left]">
                  Understand your child’s learning level in just 15 minutes. <b>Create a free Parent Account</b>, choose Board (CBSE, ICSE, ISC) and Class (5-10), and unlock instant diagnostic reports sent straight to your email.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-stone-800/90 border border-stone-700/80">
                    <p className="text-xs font-bold text-yellow-400">📝 Free 10-Mark Test</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">15-Min timed test</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-800/90 border border-stone-700/80">
                    <p className="text-xs font-bold text-yellow-400">📊 Diagnostic Insights</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Concept error detection</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-800/90 border border-stone-700/80 col-span-2">
                    <p className="text-xs font-bold text-yellow-400">📧 Direct Emailed PDF Report</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Delivered to parent inbox upon submission</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 relative z-10 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => openAuth('register')}
                  className="flex-1 py-3 px-4 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-stone-950 font-black text-xs shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
                >
                  <Users className="w-4 h-4" /> Free Parent Account <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openAuth('login')}
                  className="py-3 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs border border-stone-700 transition-all flex items-center justify-center cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section id="how-it-works" className="pt-4 sm:pt-6 pb-16 sm:pb-20 bg-white scroll-mt-[90px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold shadow-sm">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-600 animate-pulse" />
              How It Works
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize">
              Four simple steps
            </h2>
            <p className="mt-3 text-stone-600">
              The platform keeps learning simple: assess, understand, learn and improve.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-4 gap-5">
            {[
              ['01', 'Assess', 'Take a quiz or diagnostic test.', '📝', 'bg-amber-50/80 hover:border-amber-300 hover:shadow-amber-200/60', 'bg-amber-300 text-amber-900'],
              ['02', 'Analyze', 'Study Buddy identifies strong and weak topics.', '🤖', 'bg-sky-50/80 hover:border-sky-300 hover:shadow-sky-200/60', 'bg-sky-300 text-sky-900'],
              ['03', 'Learn', 'Follow lessons, resources and practice.', '📚', 'bg-rose-50/80 hover:border-rose-300 hover:shadow-rose-200/60', 'bg-rose-300 text-rose-900'],
              ['04', 'Improve', 'Retest, earn rewards and move up.', '🚀', 'bg-emerald-50/80 hover:border-emerald-300 hover:shadow-emerald-200/60', 'bg-emerald-300 text-emerald-900'],
            ].map(([number, title, text, emoji, colorClass, badgeClass], i) => (
              <div
                key={number}
                className={`group relative p-6 rounded-3xl ${colorClass} border border-stone-200/70 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-2.5 hover:shadow-2xl`}
              >
                <div className="flex items-center justify-between">
                  {/* Number badge (No black background on hover) */}
                  <span className={`w-10 h-10 rounded-xl ${badgeClass} flex items-center justify-center text-xs font-black shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    {number}
                  </span>
                  {/* Cute Emoji Bounce & Rotate Animation */}
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12 inline-block">
                    {emoji}
                  </span>
                </div>

                <h3 className="mt-5 font-black text-lg text-stone-800 transition-colors duration-300 group-hover:text-amber-600">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERSONAS / FOR EVERYONE */}
      <section
        id="for-everyone"
        className="pt-4 sm:pt-6 pb-16 sm:pb-20 relative bg-cover bg-center bg-no-repeat border-y border-stone-200/80 scroll-mt-[90px] overflow-hidden"
        style={{ backgroundImage: `url('/roles-study-bg.jpg')` }}
      >
        {/* Crisp & Clear Overlay (No Blur Filter) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-stone-200 text-stone-800 text-xs font-bold shadow-sm">
              <Users className="w-3.5 h-3.5" />
              One Platform, Three Perspectives
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize text-stone-900 drop-shadow-xs">
              Built for everyone around the learner
            </h2>
            <p className="mt-3 text-stone-700 font-semibold drop-shadow-xs">
              Students learn, teachers guide, and parents stay connected.
            </p>
          </div>

          <div className="mt-12 grid lg:grid-cols-3 gap-5">
            {(['parent', 'student', 'teacher'] as Role[]).map((role, i) => {
              const content = roleContent[role];
              const Icon = content.icon;
              const active = activeRole === role;

              return (
                <div
                  key={role}
                  className="text-left rounded-3xl p-6 border-2 border-yellow-300/90 bg-white/95 backdrop-blur-md shadow-xl shadow-stone-900/5 hover:shadow-2xl hover:shadow-yellow-500/15 hover:-translate-y-1 transition-all duration-300 reveal-on-scroll"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${role === 'student'
                      ? 'bg-yellow-50 text-yellow-600'
                      : role === 'teacher'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-sky-50 text-sky-600'
                      } flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-black">{content.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-stone-500">{content.subtitle}</p>

                  <ul className="mt-5 space-y-3">
                    {content.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2.5 text-sm text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      if (role === 'parent') {
                        openAuth('register');
                      } else if (role === 'student') {
                        openAuth('login');
                      } else {
                        document.getElementById('personalization')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }
                    }}
                    className="mt-6 text-sm font-extrabold text-yellow-500 flex items-center gap-1"
                  >
                    {role === 'student'
                      ? 'Start Learning'
                      : role === 'teacher'
                        ? 'See How It Works'
                        : 'Parent Login'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== 2-COLUMN WORD BUILDER SECTION ==================== */}
      <section id="demo" className="pt-4 sm:pt-6 pb-16 bg-amber-50/60 relative z-20 font-sans select-none px-4 scroll-mt-[90px] overflow-hidden">

        {/* Background Soft Glows */}
        <div className="absolute top-5 left-1/4 w-72 h-72 bg-yellow-200/50 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-5 right-1/4 w-80 h-80 bg-orange-200/50 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 px-4">

        {/* 1. INTERACTIVE PLATFORM DEMO VIDEO */}
        <div className="max-w-5xl mx-auto relative z-10 px-4 mb-14">
          <div className="text-center mb-8 reveal-on-scroll">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-200/60 border border-amber-300 text-amber-900 text-xs font-black mb-2 shadow-sm animate-bounce">
              <span>✨</span> Interactive Platform Demo
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">
              Experience EduJunction in Action 🚀
            </h2>
            <p className="mt-2 text-stone-600 text-sm max-w-xl mx-auto">
              Watch our interactive walkthrough video and try our hands-on demo below.
            </p>
          </div>

          <div className="w-full reveal-on-scroll">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-[#fffbeb] border border-stone-200/80 shadow-2xl">
              <iframe
                src="/EduJunction-Getting-Started.html"
                title="Getting Started with EduJunction"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* 2. MAGIC WORD ARENA (With 3D Floating Icons hugging this card) */}
        <div className="max-w-4xl mx-auto relative z-10 px-4">

          {/* 🌟 3D FLOATING ICONS (Positioned directly around Magic Word Arena) */}
          {/* 1. Top-Left: Smiling Happy Sun */}
          <img
            src="/decorations/sun.png"
            alt="Happy Sun"
            className="absolute -top-7 -left-2 sm:-left-6 lg:-left-10 w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 object-contain drop-shadow-xl animate-float-3d pointer-events-none select-none z-20"
          />

          {/* 2. Top-Right: Glowing Magic Book */}
          <img
            src="/decorations/magic-book.png"
            alt="Magic Book"
            className="absolute -top-7 -right-2 sm:-right-6 lg:-right-10 w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 object-contain drop-shadow-xl animate-float-3d pointer-events-none select-none z-20"
            style={{ animationDelay: '1.5s' }}
          />

          {/* 3. Middle-Left: ABC Alphabet Blocks */}
          <img
            src="/decorations/abc-blocks.png"
            alt="ABC Blocks"
            className="hidden md:block absolute top-[55%] -left-2 sm:-left-6 lg:-left-10 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 object-contain drop-shadow-lg animate-float-3d pointer-events-none select-none z-20"
            style={{ animationDelay: '0.8s' }}
          />

          {/* 4. Middle-Right: Pencil with Stars */}
          <img
            src="/decorations/pencil-stars.png"
            alt="Pencil & Stars"
            className="hidden md:block absolute top-[55%] -right-2 sm:-right-6 lg:-right-10 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 object-contain drop-shadow-lg animate-float-3d pointer-events-none select-none z-20"
            style={{ animationDelay: '2.2s' }}
          />

          {/* 5. Bottom-Left: Puzzle Blocks */}
          <img
            src="/decorations/puzzle-blocks.png"
            alt="Puzzle Blocks"
            className="absolute -bottom-7 -left-2 sm:-left-6 lg:-left-10 w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 object-contain drop-shadow-xl animate-float-3d pointer-events-none select-none z-20"
            style={{ animationDelay: '2.8s' }}
          />

          {/* 6. Bottom-Right: Blasting Rocket */}
          <img
            src="/decorations/rocket-abc.png"
            alt="ABC Rocket"
            className="absolute -bottom-7 -right-2 sm:-right-6 lg:-right-10 w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 object-contain drop-shadow-xl animate-float-3d pointer-events-none select-none z-20"
            style={{ animationDelay: '3.4s' }}
          />

          {/* Magic Word Arena Heading */}
          <div className="text-center mb-8 reveal-on-scroll">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-200/60 border border-amber-300 text-amber-900 text-xs font-black mb-2 shadow-sm animate-bounce">
              <span>✨</span> Magic Word Arena
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800">
              Read Clues & Build Words 🚀
            </h3>
          </div>

          {/* 2-COLUMN GRID SYSTEM (LEFT CLUE + RIGHT GAME) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

            {/* LEFT SIDE: CUTE CLUE CARD & MASCOT LOGO */}
            <div className="bg-gradient-to-br from-amber-100/80 via-orange-50/70 to-amber-50/90 backdrop-blur-xl border border-amber-200/90 rounded-3xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">

              {/* Mascot Dialogue Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-white/90 border border-amber-200/80 rounded-2xl rounded-tl-none p-3 shadow-sm flex-1">
                  <p className="text-sm md:text-base font-extrabold text-slate-800 leading-snug">
                    {isWordComplete ? "Awesome! You nailed it! Click Next to try another one! 🎉" : activeWordObj.mascotMsg}
                  </p>
                </div>
              </div>

              {/* Stylized Logo Badge Box (No Broken Images) */}
              <div className={`relative my-2 py-6 rounded-2xl bg-gradient-to-r ${activeWordObj.gradient} shadow-inner flex flex-col items-center justify-center text-white border border-white/40`}>
                <div className="text-5xl drop-shadow-md mb-2 animate-pulse">
                  {activeWordObj.logo}
                </div>
                <span className="text-xs font-black tracking-wider bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm text-center">
                  {activeWordObj.hint}
                </span>
              </div>

              {/* Secret Hint Revealer Button */}
              <div className="mt-3">
                {!showSecretHint ? (
                  <button
                    onClick={() => setShowSecretHint(true)}
                    className="w-full bg-white/80 hover:bg-white text-amber-900 border border-amber-300 text-[11px] font-black py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>💡</span> Need Extra Clue?
                  </button>
                ) : (
                  <div className="bg-amber-200/70 border border-amber-300 rounded-xl p-2.5 text-center animate-fade-in">
                    <p className="text-[11px] font-black text-amber-950">
                      {activeWordObj.secretHint}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT SIDE: GAME BOARD */}
            <div className="bg-white/90 backdrop-blur-xl border border-amber-200/80 rounded-3xl p-6 shadow-[0_15px_35px_rgba(251,191,36,0.15)] flex flex-col justify-between">

              <div>
                {/* Top Game Bar */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-100">
                  <span className="text-xs font-black text-amber-900 tracking-wider flex items-center gap-1 uppercase">
                    <span>🎮</span> Word Board
                  </span>

                  <button
                    onClick={resetCurrentWord}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>🔄</span> Reset
                  </button>
                </div>

                {/* Target Word Slots */}
                <div className="text-center my-10">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-10">
                    Tap correct letters in order
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    {activeWordObj.word.split('').map((char, idx) => {
                      const filledChar = userLetters[idx];
                      return (
                        <div
                          key={idx}
                          className={`w-10 h-11 rounded-xl flex items-center justify-center text-lg font-black transition-all duration-300 border ${filledChar
                            ? 'bg-gradient-to-tr from-amber-400 to-orange-400 text-white border-amber-300 shadow-md scale-105'
                            : 'bg-slate-100/80 border-slate-200 text-slate-300'
                            }`}
                        >
                          {filledChar || '_'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Option Letters OR Success Screen */}
              {!isWordComplete ? (
                <div className="mt-2">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {shuffledOptions.map((letter, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleLetterClick(letter)}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-amber-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 text-amber-900 font-black text-base shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 animate-bounce">
                  <div className="text-sm font-black text-emerald-600 mb-3">
                    🎉 Super Star! Word Completed! 🌟
                  </div>
                  <button
                    onClick={nextWord}
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:opacity-90 text-white font-black text-xs px-6 py-2.5 rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer tracking-wider"
                  >
                    Next Challenge ➡️
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </section>


      {/* PERSONALIZATION EXAMPLE */}
      <section id="personalization" className="py-20 bg-white relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
              <Brain className="w-3.5 h-3.5" />
              Study Buddy Personalization
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize">
              Not the same lesson for everyone
            </h2>
            <p className="mt-3 text-stone-600">
              Example: Rahul struggles with Geometry, so the platform changes his next steps.
            </p>
          </div>

          <div className="mt-16 relative">
            <style>{`
              @keyframes float-card {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
              }
              .animate-float-card {
                animation: float-card 4s ease-in-out infinite;
              }
            `}</style>

            <div className="hidden lg:block absolute top-1/2 left-[5%] right-[5%] h-1.5 bg-gradient-to-r from-blue-200 via-purple-300 to-green-300 -translate-y-1/2 rounded-full opacity-60"></div>

            <div className="grid lg:grid-cols-5 gap-6 lg:gap-4 relative z-10">
              {[
                ['📝', 'Assessment', 'Rahul scores 60%', 'bg-blue-100 border-blue-200', 'text-blue-700', 'lg:-translate-y-4'],
                ['🔍', 'Study Buddy Finds', 'Geometry is weak', 'bg-red-100 border-red-200', 'text-red-700', 'lg:translate-y-4'],
                ['📚', 'Recommends', 'Lesson + practice', 'bg-purple-100 border-purple-200', 'text-purple-700', 'lg:-translate-y-4'],
                ['🎯', 'Retest', 'Mini mock exam', 'bg-orange-100 border-orange-200', 'text-orange-700', 'lg:translate-y-4'],
                ['🎉', 'Improves', '60% → 82%', 'bg-green-100 border-green-200', 'text-green-700', 'lg:-translate-y-4'],
              ].map(([icon, title, text, colorClass, textClass, offsetClass], i) => (
                <div key={title} className={`relative flex flex-col items-center group ${offsetClass} reveal-on-scroll`} style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="animate-float-card w-full">
                    <div className="transition-transform hover:-translate-y-3 duration-300 relative">
                      <div className="absolute inset-0 bg-white/40 blur-xl rounded-full group-hover:bg-yellow-400/20 transition-colors"></div>

                      <div className={`relative w-full h-[190px] p-6 sm:p-8 lg:p-6 rounded-[2rem] bg-white/90 backdrop-blur-xl border border-white shadow-xl shadow-stone-200/50 flex flex-col items-center justify-center text-center z-10 overflow-hidden`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} blur-3xl opacity-50 rounded-full -mr-10 -mt-10`}></div>

                        <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-3xl ${colorClass} shadow-sm border border-white/50 mb-4 relative z-10`}>
                          {icon}
                        </div>
                        <h3 className={`h-7 flex items-center justify-center font-black text-lg ${textClass} mb-1.5 relative z-10`}>{title}</h3>
                        <p className="min-h-5 text-sm font-semibold text-stone-500 relative z-10">{text}</p>
                      </div>
                    </div>
                  </div>

                  {i < 4 && <div className="lg:hidden w-1 h-8 bg-gradient-to-b from-stone-200 to-stone-300 rounded-full my-2"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 relative overflow-hidden rounded-[2.5rem] border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-amber-50 p-8 sm:p-10 shadow-2xl shadow-yellow-500/10 reveal-on-scroll">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-yellow-300 rounded-full blur-[80px] opacity-40"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-amber-400 rounded-full blur-[80px] opacity-20"></div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              <div className="relative w-16 h-16 shrink-0 rounded-[1.25rem] bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30" aria-label="High ability student thinking badge">
                <Brain className="w-10 h-10" strokeWidth={1.75} />
                <span className="absolute right-2 top-1 text-sm font-black leading-none">+</span>
                <span className="absolute right-1.5 top-4 h-1.5 w-1.5 rounded-full bg-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-stone-900">Advanced students get harder content.</h3>
                <p className="mt-3 text-stone-600 font-medium text-lg leading-relaxed max-w-3xl text-justify [text-align-last:left]">
                  If a student consistently performs strongly, the platform dynamically adapts, moving them to <strong className="font-bold text-amber-700">HOTS (Higher Order Thinking Skills)</strong> questions, challenge quizzes, and advanced mock exams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* GAMIFICATION */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-stretch">

            {/* 1st CARD (Thoda andar ki or shifted with Left Padding) */}
            <div className="reveal-on-scroll flex flex-col justify-between pl-2 sm:pl-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-700 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  Learning, but make it fun
                </div>
                <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize">
                  Rewards that make children want to keep going
                </h2>
                <p className="mt-4 text-stone-600 leading-relaxed text-justify [text-align-last:left]">
                  Correct answers earn points. Milestones unlock badges. Daily activity builds streaks. Students can see a friendly leaderboard and take short educational brain breaks.
                </p>
              </div>

              <div className="mt-7 grid sm:grid-cols-2 gap-4">
                {[
                  ['⭐', 'Points', 'Earn for correct answers', 'bg-yellow-100 text-yellow-700'],
                  ['🏆', 'Badges', 'Unlock subject milestones', 'bg-orange-100 text-orange-700'],
                  ['🔥', 'Streaks', 'Keep learning every day', 'bg-red-100 text-red-700'],
                  ['🥇', 'Leaderboard', 'See friendly rankings', 'bg-blue-100 text-blue-700'],
                ].map(([icon, title, text, colorClass]) => (
                  <div key={title} className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] border border-white p-5 shadow-lg shadow-amber-900/5 group hover:-translate-y-1 transition-transform">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${colorClass} shadow-inner mb-3`}>{icon}</div>
                    <div className="font-black text-stone-800">{title}</div>
                    <div className="text-xs font-semibold text-stone-500 mt-1">{text}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* 2nd CARD */}
            <div className="group/card relative rounded-[2rem] border border-amber-200 shadow-xl hover:shadow-2xl p-6 sm:p-7 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden reveal-on-scroll flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-30 group-hover/card:opacity-50 transition-opacity"></div>

              {/* Header Section */}
              <div className="relative z-10 flex items-center justify-between shrink-0">
                <div>
                  <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">This Week</div>
                  <div className="text-2xl font-black text-stone-900 mt-1 group-hover/card:text-amber-700 transition-colors">
                    Rahul's Rewards
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 transition-transform duration-300 group-hover/card:scale-110 group-hover/card:rotate-6">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* mt-6 se Rahul's Rewards ke baad thoda extra space diya hai, aur gap-2.5 se baki boxes ke beech ka gap kam kar diya hai */}
              <div className="relative z-10 flex-1 flex flex-col justify-between gap-2.5 mt-6">
                {[
                  ['Correct answers', '+120 XP', 'text-amber-600', 'bg-white/80 hover:bg-white'],
                  ['7-day streak', '+70 XP', 'text-amber-600', 'bg-white/80 hover:bg-white'],
                  ['Geometry badge', 'Unlocked!', 'text-amber-600', 'bg-amber-100/60 hover:bg-amber-100'],
                  ['Leaderboard', '#3', 'text-amber-600', 'bg-white/80 hover:bg-white'],
                ].map(([label, value, color, bg]) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-4 py-4 rounded-2xl ${bg} border border-white shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer`}
                  >
                    <span className="text-sm font-bold text-stone-700">{label}</span>
                    <span className={`text-sm font-black ${color}`}>{value}</span>
                  </div>
                ))}

                {/* 5th Box: Brain Break */}
                <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200/60 transition-all duration-300 hover:scale-[1.01] hover:border-amber-300 shadow-sm">
                  <div className="flex items-center gap-2 font-black text-sm text-stone-900">
                    <Gamepad2 className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                    <span>Brain Break</span>
                  </div>
                  <p className="text-xs font-semibold text-stone-600 mt-0.5 leading-tight">
                    Solve 3 quick puzzles and unlock a fun fact.
                  </p>
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>
      {/* INTERACTIVE DEMO */}
      <section id="demo" className="py-20 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
              <Play className="w-3.5 h-3.5 fill-current" />
              Interactive Demo
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize">
              Unbox The Future Of Grading
            </h2>
            <p className="mt-3 text-stone-600">
              Try a sample student attempt and see how the platform gives useful feedback.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2 reveal-on-scroll">
            {(['math', 'science'] as const).map((subject) => (
              <button
                key={subject}
                onClick={() => runDemo(subject)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold ${selectedSubject === subject
                  ? 'bg-yellow-400 text-stone-900'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
              >
                {subject === 'math' ? '📐 Class 10 Math' : '🧬 Class 8 Science'}
              </button>
            ))}
          </div>

          <div className="mt-7 grid lg:grid-cols-2 gap-5 reveal-on-scroll">
            <div className="rounded-3xl bg-stone-50 border border-stone-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500">{currentQuestion.grade}</div>
                  <h3 className="font-black text-lg">{currentQuestion.subject}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                  {currentQuestion.marks} marks
                </span>
              </div>

              <p className="mt-5 text-sm font-semibold leading-relaxed">
                {currentQuestion.question}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {currentQuestion.responses.map((response, index) => (
                  <button
                    key={response.label}
                    onClick={() => {
                      setSelectedAttempt(index);
                      setIsEvaluating(true);
                      window.setTimeout(() => setIsEvaluating(false), 350);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold ${selectedAttempt === index
                      ? 'bg-white border-yellow-400 text-yellow-700'
                      : 'bg-white border-stone-200 text-stone-600'
                      }`}
                  >
                    {response.label} · {response.tag}
                  </button>
                ))}
              </div>

              <div className="mt-4 bg-white rounded-2xl border border-stone-200 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {currentAttempt.studentWork}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-sm">Study Buddy Analysis</div>
                    <div className="text-[10px] text-stone-400">Step-by-step feedback</div>
                  </div>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl text-sm font-black ${currentAttempt.score >= 9
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-yellow-50 text-amber-700'
                    }`}
                >
                  {currentAttempt.score}/10
                </div>
              </div>

              {isEvaluating ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <div className="w-7 h-7 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                  <div className="text-xs font-semibold text-stone-500">
                    Study Buddy is checking the answer...
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {currentAttempt.breakdown.map(([step, marks, pass]) => (
                    <div
                      key={step}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        {pass ? (
                          <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500" />
                        )}
                        {step}
                      </span>
                      <span
                        className={`text-xs font-black ${pass ? 'text-yellow-600' : 'text-rose-600'
                          }`}
                      >
                        {marks}
                      </span>
                    </div>
                  ))}

                  <div className="mt-4 p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
                    <div className="text-xs font-black text-yellow-700">
                      What should the student do next?
                    </div>
                    <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                      {currentAttempt.feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>





      {/* CURRICULUM */}
      <section className="py-20 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* CENTERED HEADER */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black capitalize tracking-tight text-stone-900">
              Choose the learning track that fits
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base font-medium">
              Support for school learning and higher-level preparation across the platform.
            </p>
          </div>

          {/* CUTE COMPACT CARDS GRID */}
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'CBSE Board',
                level: 'Class 10',
                text: 'Board exam & NCERT practice',
                color: 'bg-amber-100 text-amber-700 hover:border-amber-300',
                svg: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
              },
              {
                title: 'CBSE & ISC',
                level: 'Class 12',
                text: 'Advanced board preparation',
                color: 'bg-sky-100 text-sky-700 hover:border-sky-300',
                svg: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                ),
              },
              {
                title: 'ICSE Board',
                level: 'Class 10',
                text: 'ICSE exam & subject practice',
                color: 'bg-rose-100 text-rose-700 hover:border-rose-300',
                svg: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m6 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
              },
              {
                title: 'Competitive Prep',
                level: 'HOTS / Foundation',
                text: 'More challenging practice',
                color: 'bg-emerald-100 text-emerald-700 hover:border-emerald-300',
                svg: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
              },
            ].map((track) => (
              <div
                key={track.title}
                className={`group bg-stone-50/80 rounded-2xl border border-stone-200/80 p-5 hover:-translate-y-1.5 hover:bg-white hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 ${track.color}`}
              >
                {/* Icon + Level Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {track.svg}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-stone-200/60 text-[11px] font-black text-amber-700 shadow-2xs">
                    {track.level}
                  </span>
                </div>

                {/* Title & Text */}
                <h3 className="mt-4 font-black text-stone-800 text-base group-hover:text-amber-600 transition-colors">
                  {track.title}
                </h3>
                <p className="mt-1.5 text-xs font-medium text-stone-500 leading-relaxed">
                  {track.text}
                </p>
              </div>
            ))}
          </div>

          {/* CENTERED BUTTON */}
          <div className="mt-10 text-center">
            <button
              onClick={() => typeof openAuth === 'function' && openAuth('register')}
              className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-stone-900 font-black text-sm shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              <span>Explore After Sign Up</span>
              <svg className="w-4 h-4 text-stone-900 transition-transform group-hover:rotate-12 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="relative pt-16 pb-20 bg-gradient-to-b from-white to-amber-50/50 overflow-hidden border-t border-amber-200/60 shadow-[0_-12px_30px_-10px_rgba(251,191,36,0.15)]">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-200/20 blur-[100px] rounded-full pointer-events-none z-0"></div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">

          {/* Heading & Badge */}
          <div className="text-center reveal-on-scroll relative z-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100/80 border border-yellow-200 text-yellow-800 text-xs font-bold shadow-sm">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              FAQ
            </div>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight text-stone-900 capitalize">
              Your Questions, Our Answers
            </h2>
          </div>

          {/* Accordion Items */}
          <div className="mt-12 space-y-4 relative z-20">
            {faqs.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className={`bg-white/80 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden ${open ? 'border-yellow-300 shadow-xl shadow-yellow-500/10' : 'border-stone-200 hover:border-yellow-200 hover:shadow-md'
                    }`}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="w-full p-6 flex items-center justify-between gap-4 text-left font-bold text-stone-800 cursor-pointer"
                  >
                    <span className="text-lg text-stone-900">{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-yellow-100 text-yellow-700' : 'bg-stone-100 text-stone-400'
                      }`}>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {open && (
                    <div className="px-6 pb-6 text-stone-600 leading-relaxed pt-2 text-justify [text-align-last:left]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* FOOTER */}
      <PublicFooter isBackendOnline={isBackendOnline ?? undefined} onQuickDemo={onQuickDemo} />
    </div>
  );
};

