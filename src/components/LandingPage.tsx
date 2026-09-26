import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (location.search.includes('auth=login')) {
      openAuth('login');
      navigate('/', { replace: true });
    } else if (location.search.includes('auth=register')) {
      openAuth('register');
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

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

  const supportComposeUrl = 'https://mail.google.com/mail/u/0/?fs=1&to=support@edujunction.co.in&tf=cm';
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-hidden">
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
      {/* NAVBAR */}
      <PublicHeader onOpenAuth={openAuth} />

      {/* HERO */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-stone-50"
      >
        {/* ── Marquee Ticker — right below navbar ── */}
        <div className="w-full overflow-hidden relative py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-b border-amber-600/30 shadow-sm select-none">
          <div
            className="flex items-center whitespace-nowrap w-max"
            style={{ animation: 'navMarquee 25s linear infinite' }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span key={i} className="flex items-center gap-3 pr-12">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-950 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
                  <span>✨</span> NEW
                </span>
                <span className="text-stone-950 font-black text-sm sm:text-base tracking-wide drop-shadow-sm">
                  Model Test Papers Available for <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">CBSE</span>, <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">ICSE</span> &amp; <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">ISC</span> Boards
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute top-40 -left-32 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
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

              <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
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
                <a
                  href="#how-it-works"
                  className="px-7 py-3.5 rounded-2xl bg-white border border-stone-200 hover:border-yellow-300 text-stone-800 font-bold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  See How It Works
                </a>
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
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 sm:h-20 fill-yellow-50/50">
            < path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C101.33,26.6,204.66,66.19,321.39,56.44Z"></ path>
          </svg>
        </div>
      </section>

      {/* QUICK VALUE */}
      <section className="bg-yellow-50/50 relative pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      <section id="features" className="py-16 bg-stone-50">
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
                icon: Target,
                title: 'Smart Assessment',
                text: 'Take short assessments that show exactly which topics need attention.',
                bg: 'bg-amber-100/70',
                fg: 'text-amber-700',
                hoverBorder: 'hover:border-amber-300',
              },
              {
                icon: Brain,
                title: 'Study Buddy Insights',
                text: 'Study Buddy finds strengths, weak areas and common mistake patterns.',
                bg: 'bg-yellow-100/70',
                fg: 'text-yellow-700',
                hoverBorder: 'hover:border-yellow-300',
              },
              {
                icon: TrendingUp,
                title: 'Personalized Learning',
                text: 'Get lessons, resources and practice based on your current level.',
                bg: 'bg-orange-100/70',
                fg: 'text-orange-700',
                hoverBorder: 'hover:border-orange-300',
              },
              {
                icon: Trophy,
                title: 'Points & Badges',
                text: 'Earn points for correct answers and badges for milestones.',
                bg: 'bg-emerald-100/70',
                fg: 'text-emerald-700',
                hoverBorder: 'hover:border-emerald-300',
              },
              {
                icon: BarChart3,
                title: 'Progress Tracking',
                text: 'See scores, topic mastery, streaks and improvement over time.',
                bg: 'bg-sky-100/70',
                fg: 'text-sky-700',
                hoverBorder: 'hover:border-sky-300',
              },
              {
                icon: MessageSquare,
                title: 'Parent-Teacher Connect',
                text: 'Share progress and communicate securely about the student.',
                bg: 'bg-rose-100/70',
                fg: 'text-rose-700',
                hoverBorder: 'hover:border-rose-300',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group bg-white rounded-2xl border border-stone-200/80 p-5 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-stone-200/60 transition-all duration-300 reveal-on-scroll ${feature.hoverBorder}`}
                >
                  {/* Header: Icon + Title Side-by-Side */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${feature.bg} ${feature.fg} flex items-center justify-center shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-stone-800 text-base leading-snug group-hover:text-amber-600 transition-colors">
                      {feature.title}
                    </h3>
                  </div>

                  {/* Description Text */}
                  <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🌟 COMING SOON: MODEL TEST PAPERS 2027 & FREE MOCK TEST BANNER */}
      <section id="model-papers-2027" className="py-14 bg-gradient-to-br from-amber-50/70 via-yellow-50/40 to-white border-y border-amber-200/70 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-yellow-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">

          {/* 1. Model Test Papers - ICSE, CBSE & ISC 2027 Announcement Banner */}
          <div className="rounded-3xl bg-white border border-amber-300/80 p-6 sm:p-8 shadow-lg shadow-amber-500/5 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Available Now
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
                  Model Test Papers :{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">
                    ICSE, CBSE & ISC 2027
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                  Access full-length authentic specimen model papers tailored to each board: <b>CBSE (3 Hours • 80 Marks)</b>, <b>ICSE (2.5 Hours • 80 Marks)</b> and <b>ISC (3 Hours • 70/80 Marks)</b>. Designed based on 10–15 years of past question patterns, step-by-step marking schemes, and competency-based questions.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    '⏱️ CBSE: 3 Hours (80 Marks)',
                    '⏱️ ICSE: 2.5 Hours (80 Marks)',
                    '⏱️ ISC: 3 Hours (70/80 Marks)',
                    '📄 PDF & Word Downloads',
                    '10–15 Yrs Past Trends (2011–2026)',
                  ].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-bold">
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 bg-gradient-to-br from-amber-500 to-yellow-500 text-white p-6 rounded-2xl shadow-md text-center space-y-3 w-full lg:w-64 flex flex-col justify-between">
                <div>
                  <span className="text-3xl">📝</span>
                  <h3 className="font-black text-lg">Model Papers 2027</h3>
                  <p className="text-xs text-amber-100 font-bold">ICSE • CBSE • ISC</p>
                </div>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-950 hover:bg-stone-800 text-yellow-400 font-black text-xs shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
                >
                  Explore Model Papers <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Free Mock Test: Subject-Wise 10-Mark Diagnostic Mock Test Available */}
          <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-stone-950 text-xs font-black">
                  <Zap className="w-3.5 h-3.5 fill-current" /> Free Mock Test Available
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Free Subject-Wise 10-Mark Mock Test
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Understand your child’s learning level and conceptual strengths in just 15 minutes. <b>Create a free Parent Account</b>, add your child’s Board (CBSE, ICSE, ISC) and Class (5 to 10), and unlock free subject-wise practice tests with step-by-step solutions and a detailed diagnostic report delivered straight to your email.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-stone-800/90 border border-stone-700/80">
                    <p className="text-xs font-bold text-yellow-400">📝 Free 10-Mark Test</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">15-Minute timed assessment</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-800/90 border border-stone-700/80">
                    <p className="text-xs font-bold text-yellow-400">📊 Diagnostic Insights</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Concept & error analysis</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-800/90 border border-stone-700/80 col-span-2 sm:col-span-1">
                    <p className="text-xs font-bold text-yellow-400">📧 Emailed Report</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Sent directly to parent's inbox</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
                <button
                  onClick={() => openAuth('register')}
                  className="w-full py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-stone-950 font-black text-sm shadow-xl shadow-yellow-400/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Users className="w-4 h-4" /> Create Free Parent Account <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openAuth('login')}
                  className="w-full py-3 px-6 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs border border-stone-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Already Registered? Sign In
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* KNOW THE TIME */}
      <section className="py-8 bg-gradient-to-br from-yellow-50 via-amber-50/50 to-white border-y border-yellow-200 overflow-hidden relative">
        <style>{`
    @keyframes float-gentle {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-14px); }
    }
    @keyframes tick-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(3deg); }
      75% { transform: rotate(-3deg); }
    }
    @keyframes fade-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }
    .animate-tick-pulse { animation: tick-pulse 2s ease-in-out infinite; }
    .animate-wiggle { animation: wiggle 3s ease-in-out infinite; }
    .animate-fade-slide { animation: fade-slide-up 0.8s ease-out forwards; }
  `}</style>

        {/* Floating decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-8 left-[5%] text-5xl opacity-15 animate-wiggle">⏰</span>
          <span className="absolute top-16 right-[8%] text-4xl opacity-15 animate-bounce" style={{ animationDuration: '3s' }}>🕐</span>
          <span className="absolute bottom-12 left-[15%] text-4xl opacity-15 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>📐</span>
          <span className="absolute bottom-8 right-[10%] text-5xl opacity-15 animate-wiggle" style={{ animationDelay: '1.5s' }}>🌟</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Image - animated floating */}
            <div className="flex-1 flex justify-center animate-float-gentle">
              <div className="relative">
                <div className="absolute -inset-4 bg-yellow-200/30 rounded-[2rem] blur-2xl"></div>
                <img
                  src="/child-learning-clock.jpg"
                  alt="Child learning to tell time with a clock"
                  className="relative w-full max-w-md rounded-3xl border-2 border-yellow-300 shadow-2xl shadow-yellow-200/40"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left reveal-on-scroll">

              {/* <h2 className="text-4xl sm:text-5xl font-black text-stone-900 leading-tight"> */}
              <h2 className="text-4xl sm:text-5xl font-black text-stone-900 leading-normal tracking-tight flex-shrink-0">
                Short on <span className="text-yellow-500">Time?</span> ⏳
              </h2>

              <p className="mt-6 text-stone-600 text-lg max-w-md">
                Exams approaching fast? Study Buddy quickly finds your weak spots so you can focus on what really matters and learn faster.
              </p>

              <button
                onClick={() => openAuth('register')}
                className="mt-30 px-8 py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-black text-base shadow-md shadow-yellow-500/20 hover:shadow-lg hover:shadow-yellow-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                Start Learning
              </button>

            </div>

          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white">
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

      {/* PERSONAS */}
      <section id="roles" className="py-20 bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              One Platform, Three Perspectives
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize">
              Built for everyone around the learner
            </h2>
            <p className="mt-3 text-stone-600">
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
                  className="text-left rounded-3xl p-6 border-2 border-yellow-300 bg-white shadow-xl shadow-yellow-100/60 transition-all reveal-on-scroll"
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
      <section className="py-14 bg-amber-50/60 relative relative z-20 font-sans select-none px-4">

        {/* Background Soft Glows */}
        <div className="absolute top-5 left-5 w-72 h-72 bg-yellow-200/50 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-5 right-5 w-80 h-80 bg-orange-200/50 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">

          {/* Section Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-200/60 border border-amber-300 text-amber-900 text-xs font-black mb-2 shadow-sm animate-bounce">
              <span>✨</span> Magic Word Arena
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">
              Read Clues & Build Words 🚀
            </h2>
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
                <p className="mt-3 text-stone-600 font-medium text-lg leading-relaxed max-w-3xl">
                  If a student consistently performs strongly, the platform dynamically adapts, moving them to <span className="font-bold text-amber-700 bg-amber-100/50 rounded-md">HOTS (Higher Order Thinking Skills)</span> questions, challenge quizzes, and advanced mock exams.
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
                <p className="mt-4 text-stone-600 leading-relaxed">
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



      {/* PARENT TEACHER CONNECTION */}
      <section className="relative py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-200/40 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-sm">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Connected Learning
            </div>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight text-stone-900 leading-tight capitalize">
              Parents & <span className="text-stone-900">Edu</span><span className="text-yellow-500">Junction</span>: Guiding Your Child Together
            </h2>
            <p className="mt-4 text-lg text-stone-600 font-medium">
              The Study Buddy handles the teaching, while the parent stays fully informed.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-white to-blue-50/50 rounded-[2rem] border-2 border-blue-300 p-8 shadow-xl shadow-blue-200/50 overflow-hidden group hover:-translate-y-1 hover:border-blue-400 transition-all reveal-on-scroll">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-40 -mr-10 -mt-10 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner border border-blue-200 mb-6">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl text-stone-900 relative z-10">Student</h3>
              <p className="mt-2 text-sm font-semibold text-stone-600 leading-relaxed relative z-10">
                Takes tests, follows the learning Path, practices and earns rewards while the Study Buddy adapts the lessons.
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-white to-purple-50/50 rounded-[2rem] border-2 border-purple-300 p-8 shadow-xl shadow-purple-200/50 overflow-hidden group hover:-translate-y-1 hover:border-purple-400 transition-all reveal-on-scroll">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-40 -mr-10 -mt-10 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner border border-purple-200 mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl text-stone-900 relative z-10">Parent</h3>
              <p className="mt-2 text-sm font-semibold text-stone-600 leading-relaxed relative z-10">
                Views reports, understands improvement areas, and tracks their child's progress without having to teach.
              </p>
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
                    <div className="px-6 pb-6 text-stone-600 leading-relaxed pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>
      {/* FINAL CTA */}
      <section className="relative py-24 overflow-hidden bg-stone-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-yellow-600/20 to-amber-900/40 blur-[100px] rounded-full"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="mx-auto w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl shadow-yellow-500/20 border border-white/10">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight capitalize">
            Ready to make<br />learning smarter?
          </h2>
          <p className="mt-6 text-stone-300 max-w-xl mx-auto text-lg font-medium">
            Start with an assessment and let Edu<span className="text-yellow-500">Junction</span> guide the next step.
          </p>
          <a
            href={supportComposeUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-10 px-8 py-4 rounded-[1.25rem] bg-white text-stone-900 font-black inline-flex items-center gap-2 hover:scale-105 hover:bg-stone-50 transition-all duration-300 shadow-xl shadow-white/10"
          >
            Get Support <ArrowRight className="w-5 h-5" />
          </a>
          <div className="mt-3 leading-tight">
            <a href={supportComposeUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 hover:underline">support@edujunction.co.in</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <PublicFooter isBackendOnline={isBackendOnline ?? undefined} onQuickDemo={onQuickDemo} />
    </div>
  );
};

