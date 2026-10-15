import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PublicHeader } from "./common/PublicHeader";
import { PublicFooter } from "./common/PublicFooter";
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
  Star,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import ApiServices from "../services/ApiServices";
import { ACADEMIC_WORDS } from "../data/academicArenaData";

interface LandingPageProps {
  onOpenAuth: (
    mode?: "login" | "register",
    persona?: "parent" | "student",
  ) => void;
  onQuickDemo?: (role?: "admin" | "parent") => void;
}

type Role = "student" | "teacher" | "parent";

const demoQuestions = {
  math: {
    subject: "Mathematics",
    grade: "Class 10 CBSE",
    chapter: "Quadratic Equations",
    marks: 10,
    question:
      "A motorboat travels 24 km upstream and downstream. The upstream trip takes 1 hour more. Find the speed of the stream.",
    responses: [
      {
        label: "Strong Attempt",
        tag: "10/10",
        score: 10,
        studentWork:
          "Let speed of stream = x km/h.\nUpstream = 18 − x, Downstream = 18 + x.\n24/(18 − x) − 24/(18 + x) = 1\nx² + 48x − 324 = 0\nx = 6 km/h.",
        feedback:
          "Excellent step-by-step reasoning. The equation, algebra and final constraint are correct.",
        breakdown: [
          ["Define variables", "2/2", true],
          ["Set up time equation", "3/3", true],
          ["Form quadratic", "3/3", true],
          ["Validate the answer", "2/2", true],
        ],
      },
      {
        label: "Needs Help",
        tag: "7/10",
        score: 7,
        studentWork:
          "Let speed of stream = x km/h.\nUpstream = 18 − x, Downstream = 18 + x.\n24/(18 − x) − 24/(18 + x) = 1\nx² + 48x + 324 = 0\nGot negative roots.",
        feedback:
          "A sign error appeared while moving a term across the equation. The next learning step focuses on transposition.",
        breakdown: [
          ["Define variables", "2/2", true],
          ["Set up time equation", "3/3", true],
          ["Form quadratic", "1/3", false],
          ["Validate the answer", "1/2", false],
        ],
      },
    ],
  },
  science: {
    subject: "Science",
    grade: "Class 8",
    chapter: "Cell Structure & Functions",
    marks: 10,
    question:
      "Give three differences between plant and animal cells and explain why plant cells need a cell wall.",
    responses: [
      {
        label: "Model Answer",
        tag: "10/10",
        score: 10,
        studentWork:
          "Plant cells have a cell wall, plastids and a large central vacuole.\nAnimal cells do not have a cell wall or plastids and usually have smaller vacuoles.\nThe cell wall gives plant cells support and protection.",
        feedback:
          "Clear comparison with accurate reasoning and good use of scientific terms.",
        breakdown: [
          ["Cell wall difference", "2/2", true],
          ["Plastid difference", "2/2", true],
          ["Vacuole difference", "2/2", true],
          ["Explain the reason", "4/4", true],
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
    useState<keyof typeof demoQuestions>("math");
  const [selectedAttempt, setSelectedAttempt] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeRole, setActiveRole] = useState<Role>("student");
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(true);
  const [freeMockBoard, setFreeMockBoard] = useState<string>("CBSE");
  const [freeMockClass, setFreeMockClass] = useState<string>("Class 10");
  const [freeMockSubject, setFreeMockSubject] = useState<string>("Mathematics");
  const [isGeneratingMock, setIsGeneratingMock] = useState<boolean>(false);
  const [mockSuccessMsg, setMockSuccessMsg] = useState<string | null>(null);
  const [previewTrack, setPreviewTrack] = useState<any | null>(null);
  const [activeFeatureModal, setActiveFeatureModal] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewTrack(null);
        setActiveFeatureModal(null);
      }
    };
    if (previewTrack || activeFeatureModal) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [previewTrack, activeFeatureModal]);

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
        localStorage.setItem("pending_free_exam", JSON.stringify(res.exam));
        setMockSuccessMsg(
          `🎉 Free 10-Mark Mock Test generated for ${freeMockBoard} ${freeMockClass} ${freeMockSubject}!`,
        );
        setTimeout(() => {
          openAuth("login");
        }, 1000);
      }
    } catch (err: any) {
      openAuth("login");
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
            entry.target.classList.add("animate-fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const openAuth = (
    mode: "login" | "register" = "login",
    persona: "parent" | "student" = "parent",
  ) => {
    onOpenAuth(mode, persona);
  };

  const location = useLocation();
  const navigate = useNavigate();
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const landingSubPaths = ['/home', '/actions-demo', '/magic-word-arena'];
      if (landingSubPaths.includes(location.pathname)) {
        window.history.replaceState(null, "", "/");
        navigate("/", { replace: true });
      }
    }

    if (location.pathname === '/actions-demo') {
      window.history.replaceState(null, '', '/');
    }

    if (location.search.includes("auth=login")) {
      openAuth("login");
      navigate("/", { replace: true });
      return;
    } else if (location.search.includes("auth=register")) {
      openAuth("register");
      navigate("/", { replace: true });
      return;
    }

    const pathnameTarget = (location.pathname === '/free-mock-papers-2027' || location.pathname === '/model-papers-2027')
      ? 'free-mock-papers-2027'
      : null;
    const hashTarget = location.hash ? location.hash.replace('#', '') : null;
    const targetId = hashTarget === 'model-papers-2027' ? 'free-mock-papers-2027' : (hashTarget || pathnameTarget);

    if (
      targetId &&
      targetId !== "home" &&
      targetId !== "" &&
      targetId !== "hero"
    ) {
      const scrollToEl = () => {
        const el =
          document.getElementById(targetId) ||
          (targetId === "features"
            ? document.getElementById("why-edujunction")
            : document.getElementById("free-mock-papers-2027"));
        if (el) {
          const header = document.querySelector("header");
          const headerHeight = header
            ? header.getBoundingClientRect().height
            : 72;
          const y =
            el.getBoundingClientRect().top +
            window.pageYOffset -
            headerHeight -
            16;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      };
      const scrollTimer = setTimeout(scrollToEl, 80);
      return () => clearTimeout(scrollTimer);
    }
  }, [location.pathname, location.hash, location.search, navigate]);

  const runDemo = (subject: keyof typeof demoQuestions) => {
    setSelectedSubject(subject);
    setSelectedAttempt(0);
    setIsEvaluating(true);
    window.setTimeout(() => setIsEvaluating(false), 450);
  };

  const smoothScrollTo = (targetId: string, duration = 1100) => {
    const el = document.getElementById(targetId);
    if (!el) return;

    // Temporarily pause PublicHeader URL tracking so it doesn't jitter during smooth glide
    (window as any).__disableUrlSyncUntil = Date.now() + duration + 400;
    if (window.location.pathname === '/actions-demo') {
      window.history.replaceState(null, '', '/');
    }

    const header = document.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height : 72;
    const targetY = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16);
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    // Luxurious smooth cubic easeInOut curve for slow and gentle arrival
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const currentQuestion = demoQuestions[selectedSubject];
  const currentAttempt =
    currentQuestion.responses[selectedAttempt] || currentQuestion.responses[0];

  const faqs = [
    {
      q: "How does the personalized learning Path work?",
      a: "The platform studies assessment performance, finds strong and weak topics, and recommends the next lesson, practice set or challenge. The Path changes as the student improves.",
    },
    {
      q: "What happens after a student makes mistakes?",
      a: "The system identifies the topic or mistake pattern and recommends focused learning resources, practice questions and, when appropriate, another mini-test.",
    },
    {
      q: "What do advanced students receive?",
      a: "Students who consistently perform well can move to harder questions, HOTS (Higher Order Thinking Skills) practice, challenge quizzes and advanced mock exams instead of repeating basic content.",
    },
    {
      q: "Can parents and teachers see progress?",
      a: "Yes. Authorized parents and teachers can view relevant progress, reports, strengths and improvement areas, and communicate securely about the learning journey.",
    },
    {
      q: "Is learning only about tests?",
      a: "No. The platform combines assessment, personalized learning, practice, rewards, simple educational games and short fun moments to keep children engaged.",
    },
  ];

  const roleContent = {
    student: {
      title: "For Students",
      subtitle: "Learn at your own pace.",
      icon: GraduationCap,
      bullets: [
        "Personalized learning Path",
        "Practice and mock tests",
        "Points, badges and streaks",
        "Fun games and brain breaks",
      ],
    },
    teacher: {
      title: "Your Study Buddy",
      subtitle: "The smartest virtual teacher around.",
      icon: BookOpen,
      bullets: [
        "Instant step-by-step guidance",
        "Finds weak spots in seconds",
        "Recommends the best next lesson",
        "Available 24/7 for support",
      ],
    },
    parent: {
      title: "For Parents",
      subtitle: "Stay connected with your child's progress.",
      icon: Users,
      bullets: [
        "Progress and performance reports",
        "Strength and weakness insights",
        "Secure teacher communication",
        "Support learning at home",
      ],
    },
  };

  // Academic Concept Arena State & Logic (Class 5–12)
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [usedOptionIndices, setUsedOptionIndices] = useState<number[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [isWordComplete, setIsWordComplete] = useState(false);
  const [showSecretHint, setShowSecretHint] = useState(false);

  const activeWordObj = ACADEMIC_WORDS[currentWordIndex] || ACADEMIC_WORDS[0];

  const loadWord = (index: number) => {
    const word = ACADEMIC_WORDS[index].word;
    setUserLetters([]);
    setUsedOptionIndices([]);
    setIsWordComplete(false);
    setShowSecretHint(false);

    const lettersArr = word.split("");
    const extraPool = ["X", "Z", "M", "K", "L", "P", "R", "T", "B", "D"];
    const extraLetter = extraPool[Math.floor(Math.random() * extraPool.length)];
    const combined = [...lettersArr, extraLetter];

    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    setShuffledOptions(combined);
  };

  useEffect(() => {
    loadWord(currentWordIndex);
  }, [currentWordIndex]);

  const handleLetterClick = (letter: string, optionIdx: number) => {
    if (isWordComplete) return;
    if (usedOptionIndices.includes(optionIdx)) return;

    const targetWord = activeWordObj.word;
    const nextIndex = userLetters.length;

    if (targetWord[nextIndex] === letter) {
      const updated = [...userLetters, letter];
      setUserLetters(updated);
      setUsedOptionIndices((prev) => [...prev, optionIdx]);

      if (updated.length === targetWord.length) {
        setIsWordComplete(true);
      }
    }
  };

  const handleUndoLetter = () => {
    if (isWordComplete || userLetters.length === 0) return;
    setUserLetters((prev) => prev.slice(0, -1));
    setUsedOptionIndices((prev) => prev.slice(0, -1));
  };

  const nextWord = () => {
    const nextIdx = (currentWordIndex + 1) % ACADEMIC_WORDS.length;
    setCurrentWordIndex(nextIdx);
  };

  const resetCurrentWord = () => {
    loadWord(currentWordIndex);
  };

  const [demoMcqSelected, setDemoMcqSelected] = useState<number | null>(null);
  const [demoBadgeClaimed, setDemoBadgeClaimed] = useState<boolean>(false);

  const supportComposeUrl =
    "https://mail.google.com/mail/u/0/?fs=1&to=support@edujunction.co.in&tf=cm";
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
      {/* FIXED NAVBAR (Only the header stays fixed if needed) */}
      <div className="fixed top-0 left-0 right-0 z-50 shadow-sm bg-white">
        <PublicHeader onOpenAuth={openAuth} />
      </div>

      {/* HERO SECTION (Full Viewport 100vh with Integrated Quick Value Strip) */}
      <section
        id="hero"
        className="relative overflow-hidden bg-white pt-[72px] min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between"
      >
        {/* MARQUEE TICKER - Restricted to and scrolling with the Hero Section */}
        <div className="w-full overflow-hidden relative py-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-b border-amber-600/30 shadow-xs select-none shrink-0">
          <div
            className="flex items-center whitespace-nowrap w-max"
            style={{ animation: "navMarquee 80s linear infinite" }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span key={i} className="flex items-center gap-3 pr-12">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-950 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
                  <span>{i % 2 === 0 ? "✨" : "🎯"}</span>{" "}
                  {i % 2 === 0 ? "NEW" : "TIPS"}
                </span>
                <span className="text-stone-950 font-medium text-sm sm:text-base tracking-normal">
                  {i % 2 === 0 ? (
                    <>
                      Free Mock Test &amp; Model Test Papers for{" "}
                      <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">
                        CBSE
                      </span>
                      ,{" "}
                      <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">
                        ICSE
                      </span>{" "}
                      &amp;{" "}
                      <span className="bg-stone-950/10 px-1.5 py-0.5 rounded text-stone-950 font-black">
                        ISC
                      </span>{" "}
                      Boards
                    </>
                  ) : (
                    <>Practice smart. Prepare better.</>
                  )}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* HERO MAIN CONTENT GRID (Vertically Centered with min-h-0) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex-1 min-h-0 flex items-center w-full">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center w-full">
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Top Badges (Quick Test & Study Buddy) - Positioned higher with generous bottom margin */}
              <div className="mb-5 sm:mb-7 lg:mb-9">
                {/* Floating Glowing Quick Test Badge (React Bits Style) */}
                <div className="flex items-center justify-start">
                  <style>{`
                    @keyframes float-badge {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-5px); }
                    }
                    @keyframes surface-flow {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                    }
                    .animate-float-badge {
                      animation: float-badge 4s ease-in-out infinite;
                    }
                    .animate-surface-flow {
                      background: linear-gradient(135deg, #ffffff 0%, #fef08a 22%, #ffffff 40%, #8fc57e 58%, #b2dc9e 68%, #fde68a 84%, #ffffff 100%);
                      background-size: 300% 300%;
                      animation: surface-flow 6s ease infinite;
                    }
                  `}</style>
                  <button
                    type="button"
                    onClick={() => navigate("/quick-test")}
                    className="group relative inline-flex items-center animate-float-badge cursor-pointer"
                  >
                    {/* Button Surface with Tricolor Animated Flow - Squarish rounded-2xl matching Sign Up button */}
                    <span className="relative inline-flex items-center gap-3 px-5 sm:px-6 py-2.5 rounded-2xl animate-surface-flow backdrop-blur-md border border-amber-300/90 group-hover:border-[#508244]/70 transition-all duration-300 overflow-hidden shadow-2xs">
                      <span className="relative flex items-center justify-center w-6 h-6 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 group-hover:rotate-12 transition-transform duration-300">
                        <Zap className="w-3.5 h-3.5 fill-stone-950 stroke-stone-950" />
                      </span>
                      <span className="text-sm sm:text-base lg:text-lg font-black tracking-wide text-stone-900 group-hover:text-amber-700 transition-colors">
                        Take a Free Quick Test
                      </span>
                      <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Main Headline */}
              <h1
                className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight [word-spacing:0.2em] capitalize mb-3.5 sm:mb-4 lg:mb-5"
                style={{ wordSpacing: '0.2em' }}
              >
                LEARN SMARTER
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-500 mt-1 sm:mt-1.5">
                  GROW BETTER
                </span>
              </h1>

              {/* Subheading Description */}
              <p className="text-sm sm:text-base lg:text-lg text-stone-600 leading-relaxed max-w-xl sm:max-w-2xl text-justify [text-align-last:left]">
                EduJunction is the leading Learning Platform for CBSE, ICSE &
                ISC Success.
                It empowers students to master every
                subject with AI-guided practice, instant step-by-step feedback,
                personalized study paths, and exam-ready mock tests. Transform
                your prep, boost your confidence, and score top marks
                effortlessly!
              </p>

              {/* CTA Action Buttons - Pushed lower down with generous top padding */}
              <div className="pt-6 sm:pt-8 lg:pt-10 flex flex-col sm:flex-row gap-3.5">
                <button
                  onClick={() => openAuth("register")}
                  className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-stone-950 font-extrabold shadow-yellow-200 flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base border border-amber-400/60"
                >
                  Sign Up For FREE <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => smoothScrollTo('actions-demo', 1100)}
                  className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white hover:text-yellow-300 font-bold flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm text-sm sm:text-base border border-stone-800 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  See How It Works
                </button>
              </div>

              {/* Process Steps (1. Assess -> 2. Analyze -> 3. Learn -> 4. Improve) - Squarish rounded-xl matching buttons */}
              {/* <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-bold text-stone-700">
                {['Assess', 'Analyze', 'Learn', 'Improve'].map((item, i) => (
                  <React.Fragment key={item}>
                    <span
                      className="px-3.5 py-1.5 rounded-xl text-white shadow-2xs"
                      style={{
                        backgroundColor: ['#fef3c7', '#f0f9ff', '#fff1f2', '#ecfdf5'][i],
                        borderColor: ['#fcd34d', '#7dd3fc', '#fda4af', '#6ee7b7'][i],
                        color: ['#78350f', '#0c4a6e', '#881337', '#064e3b'][i],
                        borderWidth: '1px',
                      }}
                    >
                      {i + 1}. {item}
                    </span>
                    {i < 3 && <ArrowRight className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
                  </React.Fragment>
                ))}
              </div> */}
            </div>

            {/* HERO RIGHT IMAGE */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <style>{`
                @keyframes float-animation {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                  100% { transform: translateY(0px); }
                }
                .animate-float-hero {
                  animation: float-animation 6s ease-in-out infinite;
                }
              `}</style>

              <img
                src="/hero-duo-students-cutout.png"
                alt="EduJunction Study Buddies"
                className="w-auto h-auto max-h-[440px] sm:max-h-[490px] lg:max-h-[530px] xl:max-h-[570px] max-w-full object-contain animate-float-hero select-none"
              />
            </div>
          </div>
        </div>

        {/* INTEGRATED QUICK VALUE BAR (Assess, Insights, Path, Rewards) */}
        <div className="w-full bg-white/85 backdrop-blur-md border-t border-amber-200/80 py-2.5 sm:py-3 relative z-20 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
              {[
                ["📝", "Assess", "Find what you know"],
                ["🤖", "Study Buddy Insights", "Find where you need help"],
                ["🎯", "Personal Path", "Get the right next step"],
                ["🏆", "Rewards", "Stay motivated"],
              ].map(([icon, title, text]) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-2xs">
                    {icon}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-stone-900">
                      {title}
                    </div>
                    <div className="text-[11px] sm:text-xs font-medium text-stone-600">
                      {text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ACTIONS & DEMO */}
      <section id="actions-demo" className="pt-12 sm:pt-16 pb-16 sm:pb-20 bg-gradient-to-b from-amber-50/50 via-stone-50/40 to-amber-50/30 border-t border-amber-200/70 relative scroll-mt-[90px] overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-yellow-200/30 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-100/90 border border-yellow-200/80 text-yellow-800 text-xs sm:text-sm font-bold shadow-2xs">
              <Lightbulb className="w-4 h-4 text-yellow-600 animate-pulse" />
              Actions &amp; Demo
            </div>
            <h2
              className="mt-3 text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black text-stone-900 tracking-tight leading-tight whitespace-normal sm:whitespace-nowrap"
            >
              Experience Edu<span className="text-yellow-500">Junction</span> in <span className="text-yellow-500">Action</span> 🚀
            </h2>
            <p className="mt-2 text-stone-600 text-xs sm:text-sm xl:text-base font-medium max-w-xl mx-auto leading-relaxed">
              Watch our interactive walkthrough video and try our hands-on demo below.
            </p>
          </div>

          {/* INTERACTIVE PLATFORM DEMO VIDEO */}
          <div className="mt-10 sm:mt-12 w-full flex justify-center reveal-on-scroll">
            <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-[#fffbeb] border border-stone-200/80 shadow-xl ring-1 ring-stone-900/5">
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
      </section>

      {/* 🌟 FREE MOCK TEST PAPERS 2027 */}
      <section
        id="free-mock-papers-2027"
        className="min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] flex flex-col justify-center py-3 lg:py-4 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50/70 via-yellow-50/40 to-white border-y border-amber-200/70 relative scroll-mt-[72px]"
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-yellow-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 w-full flex flex-col justify-center my-auto">
          <div className="text-center max-w-2xl mx-auto mb-3 lg:mb-3.5 reveal-on-scroll shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100/90 border border-yellow-200 text-yellow-800 text-xs sm:text-sm font-bold shadow-2xs">
              <FileText className="w-4 h-4 text-yellow-600 animate-pulse" />
              Free Mock Test Papers 2027
            </div>
            <h2
              className="mt-2 text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black capitalize tracking-tight text-stone-900 leading-tight"
              style={{ wordSpacing: "0.2em" }}
            >
              <span className="text-yellow-500">FREE</span> MOCK TEST &amp;{" "}
              <span className="text-yellow-500">MODEL TEST PAPERS</span> FOR
              CBSE, ICSE &amp; ISC
            </h2>
            <p className="mt-1.5 text-stone-600 text-xs sm:text-sm xl:text-base font-medium max-w-xl mx-auto leading-relaxed">
              Practice free unlimited CBSE, ICSE &amp; ISC mock tests, model
              question papers and online practice tests.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-3.5 lg:gap-5 items-stretch">
            {/* 1. Free Mock Test Papers - ICSE, CBSE & ISC 2027 (PRIMARY HERO SPOTLIGHT) */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-stone-950 p-4 sm:p-5 lg:p-4.5 xl:p-5 shadow-xl shadow-amber-500/20 border-2 border-amber-300 ring-2 ring-amber-400/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300">
              {/* Shimmer Light Accent */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-white/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

              <div className="space-y-1.5 lg:space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-950 text-yellow-300 text-xs font-black uppercase tracking-wider shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                    2027 Flagship Edition
                  </div>
                  <span className="text-lg drop-shadow-sm">📝</span>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-xl xl:text-2xl font-black text-stone-950 tracking-tight leading-snug">
                  Model Test Papers Available For :{" "}
                  <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                    CBSE, ICSE &amp; ISC 2027
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-900 leading-snug font-semibold text-justify [text-align-last:left]">
                  Access full-length authentic specimen model papers:{" "}
                  <b>CBSE (3h • 80m)</b>, <b>ICSE (2.5h • 80m)</b> and{" "}
                  <b>ISC (3h • 70/80m)</b>. Built on 10–15 years of past
                  question patterns and step-by-step marking rubrics.
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {[
                    "⏱️ CBSE: 3 Hours (80 Marks)",
                    "⏱️ ICSE: 2.5 Hours (80 Marks)",
                    "⏱️ ISC: 3 Hours (70/80 Marks)",
                    "📄 PDF & Word Downloads",
                    "10–15 Yrs Past Trends (2011–2026)",
                    "🎯 Step-by-Step Marking Rules",
                  ].map((tag) => (
                    <div
                      key={tag}
                      className="px-2 py-1 rounded-xl bg-white/90 backdrop-blur-sm border border-amber-900/10 text-stone-950 text-xs sm:text-[12.5px] font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <span className="text-emerald-700 font-extrabold text-sm">
                        ✓
                      </span>{" "}
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 lg:pt-3 relative z-10">
                <button
                  onClick={() => openAuth("register")}
                  className="m-auto py-2.5 px-5 rounded-2xl bg-stone-950 hover:bg-stone-900 text-yellow-400 hover:text-yellow-300 font-black text-xs sm:text-sm shadow-stone-950/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  Explore Model Test Papers{" "}
                  <ArrowRight className="w-3.5 h-3.5 text-yellow-400 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* 2. Free Mock Test: Subject-Wise 10-Mark Diagnostic Mock Test Available (SUPPORTING CARD) */}
            <div className="rounded-3xl bg-white/95 backdrop-blur-sm border border-stone-200/90 text-stone-900 p-4 sm:p-5 lg:p-4.5 xl:p-5 shadow-md shadow-stone-900/5 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg hover:border-amber-300/80 transition-all">
              <div className="space-y-1.5 lg:space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-100 border border-yellow-300/80 text-amber-950 text-xs font-black">
                    <Zap className="w-3.5 h-3.5 text-yellow-600 fill-current" />{" "}
                    Free Mock Test Available
                  </div>
                  <span className="text-lg">⚡</span>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-xl xl:text-2xl font-black text-stone-900 tracking-tight leading-snug">
                  Free Subject-Wise Mock Test
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-snug font-medium text-justify [text-align-last:left]">
                  Understand your child’s learning level in just 15 minutes.{" "}
                  <b>Create a free Parent Account</b>, choose Board (CBSE, ICSE,
                  ISC) and Class (5-12), and unlock instant diagnostic reports
                  sent straight to your email.
                </p>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="p-1.5 lg:p-2 rounded-xl bg-amber-50/60 border border-amber-200/70">
                    <p className="text-xs sm:text-[13px] font-bold text-amber-900">
                      📝 Free Mock Test
                    </p>
                    <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 font-medium">
                      15-Min timed test
                    </p>
                  </div>
                  <div className="p-1.5 lg:p-2 rounded-xl bg-amber-50/60 border border-amber-200/70">
                    <p className="text-xs sm:text-[13px] font-bold text-amber-900">📊 Insights</p>
                    <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 font-medium">Concept error detection</p>
                  </div>
                  <div className="p-1.5 lg:p-2 rounded-xl bg-amber-50/60 border border-amber-200/70 col-span-2">
                    <p className="text-xs sm:text-[13px] font-bold text-amber-900">
                      📧 Direct Emailed PDF Report
                    </p>
                    <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 font-medium">
                      Delivered to parent inbox upon submission
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 lg:pt-3 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => openAuth("register")}
                  className="w-fit py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  Create Free Parent Account
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>

                <button
                  onClick={() => openAuth("login")}
                  className="w-fit py-2.5 px-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm border border-stone-300 transition-all flex items-center justify-center cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ==================== 2-COLUMN WORD BUILDER SECTION ==================== */}
      <section id="magic-word-arena" className="pt-4 sm:pt-6 pb-16 bg-amber-50/60 relative z-20 font-sans select-none px-4 scroll-mt-[90px] overflow-hidden">

        {/* Background Soft Glows */}
        <div className="absolute top-5 left-1/4 w-72 h-72 bg-yellow-200/50 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-5 right-1/4 w-80 h-80 bg-orange-200/50 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 px-4">
          {/* ACADEMIC CONCEPT ARENA */}
          <div className="max-w-4xl mx-auto relative z-10 px-4">

            {/* Academic Concept Arena Heading */}
            <div className="text-center mb-8 reveal-on-scroll">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-black mb-2 shadow-2xs">
                <span>⚡</span> Academic Concept Arena
              </div>
              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-normal capitalize"
                style={{ wordSpacing: '0.25em' }}
              >
                READ CLUES &amp; BUILD WORDS 🚀
              </h3>
              <p className="mt-2 text-stone-600 text-xs sm:text-sm font-semibold max-w-lg mx-auto">
                Test your science, math &amp; general knowledge foundation across Class 5–12 syllabus!
              </p>
            </div>

            {/* 2-COLUMN GRID SYSTEM (LEFT CLUE + RIGHT GAME) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

              {/* LEFT SIDE: CLUE CARD & LOGO */}
              <div className="bg-gradient-to-br from-amber-100/80 via-orange-50/70 to-amber-50/90 backdrop-blur-xl border border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">

                {/* Question & Subject Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/95 border border-amber-300/80 text-amber-900 shadow-2xs">
                      📚 {activeWordObj.subject}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950">
                      {activeWordObj.classLevel}
                    </span>
                  </div>

                  <div className="bg-white/95 border border-amber-200/80 rounded-2xl rounded-tl-none p-3.5 sm:p-4 shadow-2xs">
                    <p className="text-sm md:text-base font-extrabold text-slate-800 leading-snug">
                      {isWordComplete ? "Awesome! Concept Decoded! Click Next to try another one! 🎉" : activeWordObj.mascotMsg}
                    </p>
                  </div>
                </div>

                {/* Clean Object Showcase Box (Without Circle, Isolated Like a PNG Image) */}
                <div className="relative my-2 py-6 px-4 rounded-2xl bg-white/90 border border-amber-200/80 shadow-xs flex flex-col items-center justify-center text-center">
                  <div className="mb-3 transform transition-transform duration-300 hover:scale-110 animate-gentle-float">
                    <span className="text-6xl sm:text-7xl drop-shadow-md select-none leading-none inline-block filter">
                      {activeWordObj.logo}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-stone-800 bg-amber-100/90 border border-amber-300/80 px-4 py-1.5 rounded-full shadow-2xs">
                    {activeWordObj.hint}
                  </span>
                </div>

                {/* Secret Hint Revealer Button */}
                <div className="mt-3.5">
                  {!showSecretHint ? (
                    <button
                      onClick={() => setShowSecretHint(true)}
                      className="w-full bg-white/90 hover:bg-white text-amber-900 border border-amber-300 text-xs font-black py-2.5 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer hover:border-amber-400"
                    >
                      <span>💡</span> Need Extra Clue / Formula?
                    </button>
                  ) : (
                    <div className="bg-amber-100/90 border border-amber-300 rounded-xl p-3 text-center animate-fade-in shadow-2xs">
                      <p className="text-xs font-bold text-amber-950">
                        {activeWordObj.secretHint}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT SIDE: GAME BOARD */}
              <div className="bg-white/95 backdrop-blur-xl border border-amber-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">

                <div>
                  {/* Top Game Bar */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-100">
                    <span className="text-xs font-black text-amber-900 tracking-wider flex items-center gap-1.5 uppercase">
                      <span>🎮</span> Concept Board ({currentWordIndex + 1}/{ACADEMIC_WORDS.length})
                    </span>

                    <div className="flex items-center gap-2">
                      {userLetters.length > 0 && !isWordComplete && (
                        <button
                          onClick={handleUndoLetter}
                          className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          title="Undo last letter"
                        >
                          <RotateCcw className="w-3 h-3" /> Back
                        </button>
                      )}
                      <button
                        onClick={resetCurrentWord}
                        className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                    </div>
                  </div>

                  {/* Target Word Slots */}
                  <div className="text-center my-6 sm:my-8">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-6">
                      Tap letters below in sequence to solve the concept
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                      {activeWordObj.word.split('').map((char, idx) => {
                        const filledChar = userLetters[idx];
                        return (
                          <div
                            key={idx}
                            onClick={() => filledChar && handleUndoLetter()}
                            className={`w-11 h-12 sm:w-12 sm:h-14 rounded-xl flex items-center justify-center text-lg sm:text-xl font-black transition-all duration-300 border cursor-pointer select-none ${filledChar
                              ? 'bg-gradient-to-tr from-amber-400 to-orange-400 text-white border-amber-300 shadow-sm scale-105'
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
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                      {shuffledOptions.map((letter, idx) => {
                        const isUsed = usedOptionIndices.includes(idx);
                        return (
                          <button
                            key={idx}
                            disabled={isUsed}
                            onClick={() => handleLetterClick(letter, idx)}
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl font-black text-base sm:text-lg border transition-all cursor-pointer flex items-center justify-center ${isUsed
                              ? 'opacity-25 pointer-events-none scale-90 bg-stone-100 border-stone-200 text-stone-300 shadow-none'
                              : 'bg-gradient-to-br from-white to-amber-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 text-amber-900 shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95'
                              }`}
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="text-sm font-black text-emerald-600 mb-3">
                      🎉 Excellent! Concept Decoded! 🌟
                    </div>
                    <button
                      onClick={nextWord}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-2xl shadow-sm active:scale-95 transition-all cursor-pointer tracking-wider inline-flex items-center gap-1.5"
                    >
                      Next Concept ➡️
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* FEATURES */}
      <section
        id="features"
        className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-stone-50/60 via-amber-50/20 to-white border-b border-stone-200/60 relative scroll-mt-[72px] overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-yellow-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-200/25 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col justify-center my-auto">
          <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10 reveal-on-scroll shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-100/90 border border-yellow-300/80 text-yellow-900 text-xs sm:text-sm font-black shadow-2xs">
              <Sparkles className="w-4 h-4 text-yellow-600 animate-pulse" />
              What You Can Do
            </div>
            <h2
              className="mt-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight uppercase text-stone-900 leading-tight whitespace-normal sm:whitespace-nowrap"
              style={{ wordSpacing: "0.2em" }}
            >
              EVERYTHING YOU NEED TO{" "}
              <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 bg-clip-text text-transparent">
                KNOW BETTER
              </span>
            </h2>
            <p className="mt-2 text-stone-600 text-xs sm:text-sm xl:text-base font-medium max-w-xl mx-auto leading-relaxed">
              Simple tools for learning, practice, motivation and communication.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                id: "smart-assessment",
                icon: Target,
                tag: "Diagnostic Engine",
                title: "Smart Assessment",
                subtitle:
                  "Adaptive diagnostic testing calibrated to ICSE & CBSE standards",
                text: "Take short assessments that show exactly which topics need attention.",
                cardBg:
                  "bg-amber-100/85 hover:bg-amber-100 border-amber-300/90 hover:border-amber-400",
                tagStyle: "bg-white/95 text-amber-900 border-amber-300/80",
                titleHover: "group-hover:text-amber-700",
                cardHoverGlow: "hover:shadow-xl hover:shadow-amber-500/15",
                buttonDefault:
                  "bg-amber-500 text-white border-amber-600/40 shadow-xs shadow-amber-500/20",
                buttonHover:
                  "group-hover:bg-amber-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-amber-500/30",
                tags: [
                  "Chapter Quizzes",
                  "Step-by-Step Marks",
                  "Instant Auto-Grade",
                ],
                highlights: [
                  "Chapter-wise diagnostic quizzes (5-10 mins)",
                  "Step-by-step marking scheme aligned to CBSE/ICSE blueprint",
                  "Instant auto-grading with explanation for wrong answers",
                  "Detects speed vs accuracy bottlenecks",
                ],
              },
              {
                id: "study-buddy",
                icon: Brain,
                tag: "AI Mentor",
                title: "Study Buddy Insights",
                subtitle:
                  "mentor analyzing student learning behavior and common traps",
                text: "Study Buddy finds strengths, weak areas and common mistake patterns.",
                cardBg:
                  "bg-yellow-100/85 hover:bg-yellow-100 border-yellow-300/90 hover:border-yellow-400",
                tagStyle: "bg-white/95 text-yellow-900 border-yellow-300/80",
                titleHover: "group-hover:text-yellow-800",
                cardHoverGlow: "hover:shadow-xl hover:shadow-yellow-500/15",
                buttonDefault:
                  "bg-yellow-500 text-stone-900 border-yellow-600/40 shadow-xs shadow-yellow-500/20",
                buttonHover:
                  "group-hover:bg-yellow-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-yellow-500/30",
                tags: [
                  "Misconception Tracker",
                  "Targeted Revisions",
                  "Smart Study Plan",
                ],
                highlights: [
                  "Identifies misconception patterns before exam day",
                  "Recommends targeted concept revision sheets",
                  "Tracks prerequisite gaps across previous classes",
                  "Personalized  study scheduler",
                ],
              },
              {
                id: "personalized",
                icon: TrendingUp,
                tag: "Adaptive Roadmap",
                title: "Personalized Learning",
                subtitle:
                  "Dynamic learning roadmap that scales with student performance",
                text: "Get lessons, resources and practice based on your current level.",
                cardBg:
                  "bg-orange-100/85 hover:bg-orange-100 border-orange-300/90 hover:border-orange-400",
                tagStyle: "bg-white/95 text-orange-900 border-orange-300/80",
                titleHover: "group-hover:text-orange-700",
                cardHoverGlow: "hover:shadow-xl hover:shadow-orange-500/15",
                buttonDefault:
                  "bg-orange-500 text-white border-orange-600/40 shadow-xs shadow-orange-500/20",
                buttonHover:
                  "group-hover:bg-orange-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-orange-500/30",
                tags: [
                  "3-Tier Difficulty",
                  "Weak Topic Drills",
                  "Custom Paper Gen",
                ],
                highlights: [
                  "3-Tier Difficulty Calibration (Simple, Medium, Hard/HOTS)",
                  "Automatic remediation exercises for weak topics",
                  "Custom paper generator tailored to board syllabus",
                  "Adaptive revision speed adjustments",
                ],
              },
              {
                id: "points-badges",
                icon: Trophy,
                tag: "Gamified Rewards",
                title: "Points & Badges",
                subtitle:
                  "Gamified rewards system to keep students engaged every day",
                text: "Earn points for correct answers and badges for milestones.",
                cardBg:
                  "bg-emerald-100/85 hover:bg-emerald-100 border-emerald-300/90 hover:border-emerald-400",
                tagStyle: "bg-white/95 text-emerald-900 border-emerald-300/80",
                titleHover: "group-hover:text-emerald-700",
                cardHoverGlow: "hover:shadow-xl hover:shadow-emerald-500/15",
                buttonDefault:
                  "bg-emerald-500 text-white border-emerald-600/40 shadow-xs shadow-emerald-500/20",
                buttonHover:
                  "group-hover:bg-emerald-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-emerald-500/30",
                tags: ["Accuracy XP", "Milestone Badges", "Daily Streak Bonus"],
                highlights: [
                  "Earn XP points for quiz completions and accuracy",
                  'Unlock badges like "Math Wizard", "Formula Champ", "Streak Master"',
                  "Daily learning streak multiplier bonus",
                  "Friendly leaderboards for peer motivation",
                ],
              },
              {
                id: "progress-tracking",
                icon: BarChart3,
                tag: "Visual Analytics",
                title: "Progress Tracking",
                subtitle:
                  "Visual analytics dashboard for students, teachers, and parents",
                text: "See scores, topic mastery, streaks and improvement over time.",
                cardBg:
                  "bg-sky-100/85 hover:bg-sky-100 border-sky-300/90 hover:border-sky-400",
                tagStyle: "bg-white/95 text-sky-900 border-sky-300/80",
                titleHover: "group-hover:text-sky-700",
                cardHoverGlow: "hover:shadow-xl hover:shadow-sky-500/15",
                buttonDefault:
                  "bg-sky-500 text-white border-sky-600/40 shadow-xs shadow-sky-500/20",
                buttonHover:
                  "group-hover:bg-sky-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-sky-500/30",
                tags: ["Real-Time Charts", "Topic Mastery %", "PDF Dossiers"],
                highlights: [
                  "Real-time accuracy & speed progress charts",
                  "Chapter-by-chapter mastery percentages",
                  "Historical exam score trend analysis",
                  "Exportable PDF performance dossiers",
                ],
              },
              {
                id: "parent-teacher",
                icon: MessageSquare,
                tag: "Collaborative Loop",
                title: "Parent-Teacher Connect",
                subtitle:
                  "Seamless parent notifications & automated email/PDF report dispatch",
                text: "Share progress and communicate securely about the student.",
                cardBg:
                  "bg-rose-100/85 hover:bg-rose-100 border-rose-300/90 hover:border-rose-400",
                tagStyle: "bg-white/95 text-rose-900 border-rose-300/80",
                titleHover: "group-hover:text-rose-700",
                cardHoverGlow: "hover:shadow-xl hover:shadow-rose-500/15",
                buttonDefault:
                  "bg-rose-500 text-white border-rose-600/40 shadow-xs shadow-rose-500/20",
                buttonHover:
                  "group-hover:bg-rose-600 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-rose-500/30",
                tags: [
                  "Automated PDF Dispatch",
                  "Parent Portal",
                  "Teacher Notes",
                ],
                highlights: [
                  "Automated PDF exam report sent directly to parent email",
                  "Parent dashboard link for child activity monitoring",
                  "Teacher note & feedback attachment support",
                  "WhatsApp performance alerts",
                ],
              },
            ].map((feature) => {
              return (
                <div
                  key={feature.id}
                  onClick={() => {
                    setActiveFeatureModal(feature.id);
                    setDemoMcqSelected(null);
                  }}
                  className={`group relative ${feature.cardBg} rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm hover:shadow-xl ${feature.cardHoverGlow} hover:-translate-y-1.5 active:translate-y-0 transition-all duration-300 reveal-on-scroll cursor-pointer overflow-hidden flex flex-col justify-between`}
                >
                  <div>
                    {/* Header: Category Badge + Title & Action Button */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span
                          className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${feature.tagStyle} mb-1.5 shadow-2xs`}
                        >
                          {feature.tag}
                        </span>
                        <h3
                          className={`font-black text-stone-900 text-lg sm:text-xl leading-snug ${feature.titleHover} transition-colors`}
                        >
                          {feature.title}
                        </h3>
                      </div>

                      <span
                        className={`text-[11px] font-black px-3 py-1 rounded-full border ${feature.buttonDefault} ${feature.buttonHover} transition-all duration-300 shrink-0 inline-flex items-center gap-1 shadow-2xs`}
                      >
                        Preview{" "}
                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          ↗
                        </span>
                      </span>
                    </div>

                    {/* Description Text */}
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-semibold">
                      {feature.text}
                    </p>
                  </div>

                  {/* Micro-Features Bottom Badges */}
                  <div className="mt-5 pt-3.5 border-t border-stone-300/50 flex flex-wrap gap-1.5">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/90 border border-stone-200/80 text-stone-800 shadow-2xs group-hover:bg-white group-hover:border-stone-300 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
                demoTitle: 'Interactive Live Preview: MCQ',
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
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${demoMcqSelected === idx
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
                badge: 'Mentor Insights',
                badgeColor: 'bg-yellow-100 text-yellow-950 border-yellow-300',
                subtitle: 'Personalized Learning Companion & Mistake Detector',
                description: 'Study Buddy acts as a 24/7 personal tutor that finds root causes of mistakes, recommends remedial practice, and builds long-term memory.',
                highlights: [
                  'Pinpoints common exam traps and formula calculation slips',
                  'Builds personalized revision Flashcards and Mind Maps',
                  'Reminds students to review prerequisite topics before new chapters',
                  'Natural language doubt clarification in plain English & Bengali'
                ],
                demoTitle: 'Live Insights Dashboard Preview',
                demoWidget: (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-yellow-50/70 border border-yellow-200/80 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between font-black text-stone-800">
                      <span>🤖 Study Buddy Misconception Radar</span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">Active Analysis</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2.5">
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
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-2.5 text-xs">
                    <div className="font-black text-stone-800 flex justify-between items-center">
                      <span>🚀 Class 10 Math Roadmap</span>
                      <span className="text-orange-700 font-bold">Level 3 Unlocked</span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-2.5">
                      <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-stone-200">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</div>
                        <div>
                          <div className="font-bold text-stone-800 text-[11px]">Level 1: Foundational</div>
                          <div className="text-[10px] text-stone-500">Mastered (100%)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-stone-200">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</div>
                        <div>
                          <div className="font-bold text-stone-800 text-[11px]">Level 2: Standard Formula</div>
                          <div className="text-[10px] text-stone-500">Mastered (94%)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-amber-100 rounded-xl border border-amber-300">
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse shrink-0">🔥</div>
                        <div>
                          <div className="font-bold text-amber-950 text-[11px]">Level 3: Board HOTS</div>
                          <div className="text-[10px] text-amber-800">Active Challenge</div>
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
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5 text-xs">
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
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center font-black text-sky-950">
                      <span>📊 Subject Mastery Breakdown</span>
                      <span className="text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full">+14% Score Increase</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
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
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-black text-rose-950">
                      <span className="p-1 rounded bg-rose-200 text-rose-800">📄</span>
                      <span>Automated Parent Email Report</span>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-stone-200 space-y-1 text-[11px]">
                      <div className="flex justify-between font-bold text-stone-800">
                        <span>To: parent@edujunction.co.in</span>
                        <span className="text-emerald-600">✓ Delivered</span>
                      </div>
                      <p className="text-stone-600">
                        "Dear Parent, your child completed <strong>ICSE Class 10 Physics Model Paper 1</strong> with <strong>88% score</strong>. Detailed PDF report is attached."
                      </p>
                      <div className="pt-0.5 flex items-center justify-between font-bold text-amber-700 text-[11px]">
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
            const modalThemes: Record<string, string> = {
              'smart-assessment': 'from-amber-500/15 via-amber-50/80 to-white',
              'study-buddy': 'from-yellow-500/15 via-yellow-50/80 to-white',
              'personalized': 'from-orange-500/15 via-orange-50/80 to-white',
              'points-badges': 'from-emerald-500/15 via-emerald-50/80 to-white',
              'progress-tracking': 'from-sky-500/15 via-sky-50/80 to-white',
              'parent-teacher': 'from-rose-500/15 via-rose-50/80 to-white',
            };

            const headerGradient = modalThemes[activeFeatureModal] || 'from-amber-500/15 via-amber-50/80 to-white';

            return createPortal(
              <div
                onClick={() => setActiveFeatureModal(null)}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-stone-950/75 backdrop-blur-md animate-in fade-in duration-200"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-full max-w-2xl sm:max-w-3xl lg:max-w-[800px] rounded-[26px] shadow-2xl border border-stone-200/90 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                >
                  {/* Clean Header (No logo/icon box) */}
                  <div className={`p-4 sm:p-5 px-6 border-b border-stone-200/70 bg-gradient-to-r ${headerGradient} flex items-center justify-between gap-4 shrink-0`}>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-1">
                        <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${featData.badgeColor}`}>
                          {featData.badge}
                        </span>
                        <h3 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">{featData.title}</h3>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-stone-600 truncate">{featData.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveFeatureModal(null)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-stone-500 hover:text-stone-900 border border-stone-200/80 hover:border-stone-300 flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 shrink-0 cursor-pointer"
                      aria-label="Close preview modal"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* Body (Balanced width, 2x2 highlights, scrollable if needed) */}
                  <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                    {/* Description Callout */}
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/80">
                      <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed">
                        {featData.description}
                      </p>
                    </div>

                    {/* Highlights Grid */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">Key Feature Highlights</h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {featData.highlights.map((h: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-stone-300 hover:shadow-xs transition-all">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] shadow-2xs">
                              ✓
                            </span>
                            <span className="text-[11px] sm:text-xs font-bold text-stone-800 leading-snug">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Demo Widget (Clean title, no dot) */}
                    {featData.demoWidget && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">{featData.demoTitle}</h4>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Interactive Simulation
                          </span>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-xs">
                          {featData.demoWidget}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>,
              document.body
            );
          })()}
        </div>
      </section>

      {/* 💎 WHY EDUJUNCTION (EDITORIAL STORY & VALUE NARRATIVE) */}
      <section
        id="why-edujunction"
        className="pt-4 sm:pt-6 pb-16 sm:pb-20 bg-white border-b border-stone-200/70 relative overflow-hidden scroll-mt-[90px]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Why EduJunction
            </div>
            <h2
              className="mt-4 text-3xl sm:text-4xl lg:text-4xl font-black text-stone-900 tracking-normal leading-tight whitespace-nowrap overflow-x-auto pb-2"
              style={{ wordSpacing: "0.25em" }}
            >
              Edu<span className="text-yellow-500">Junction</span> vs <span className="text-yellow-500">Other</span> Platforms
            </h2>
          </div>

          {/* 2-Column Open / Borderless Layout: Left 3D Motion Image & Right Description */}
          <div className="mt-10 lg:mt-12 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center reveal-on-scroll">
            {/* Left Side: Realistic Student Floating Cutout (Borderless, Transparent PNG on pure white) */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="relative w-full flex items-center justify-center">
                <img
                  src="/why-edujunction-student-cutout.png"
                  alt="Student studying with EduJunction"
                  className="w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[450px] h-auto max-h-[440px] object-contain select-none transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Side: Description */}
            <div className="lg:col-span-7 space-y-4">
              <p className="text-stone-600 text-base sm:text-lg lg:text-[17.5px] leading-relaxed sm:leading-[1.85] text-justify [text-align-last:left]">
                While traditional platforms offer generic PDFs with zero
                diagnostic insights,{" "}
                <strong className="text-stone-900 font-bold">
                  EduJunction
                </strong>{" "}
                brings the exact{" "}
                <strong className="text-amber-800 font-bold">
                  Upcoming ICSE, ISC &amp; CBSE board blueprints
                </strong>{" "}
                to life with step-by-step scoring rubrics. Our built-in{" "}
                <strong className="text-stone-900 font-bold">
                  Study Buddy
                </strong>{" "}
                identifies why a student struggled, pinpointing conceptual traps
                and prerequisite knowledge gaps before exam day.
              </p>
              <p className="text-stone-600 text-base sm:text-lg lg:text-[17.5px] leading-relaxed sm:leading-[1.85] text-justify [text-align-last:left]">
                Every test submission automatically compiles and emails an authentic <strong className="text-stone-900 font-bold">PDF Dossier</strong> directly to parents with chapter-wise mastery breakdowns, ensuring seamless transparency. Inside the exam interface, students can solve numericals, draft diagrams, and utilize digital scratchpads directly with our <strong className="text-stone-900 font-bold">Interactive STEM Canvas</strong>. We believe quality education should be accessible and student-centric — empowering learners with <strong className="text-amber-800 font-bold">fair, modular, per-paper pricing</strong> and absolutely no forced annual lock-ins, putting students in complete control of their success.
              </p>
            </div>
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
            <h2
              className="mt-4 text-3xl sm:text-4xl font-black capitalize tracking-normal text-stone-900 drop-shadow-xs"
              style={{ wordSpacing: "0.25em" }}
            >
              BUILT FOR EVERYONE AROUND THE LEARNER
            </h2>
            <p className="mt-3 text-stone-700 font-semibold drop-shadow-xs">
              Students learn, teachers guide, and parents stay connected.
            </p>
          </div>

          <div className="mt-12 grid lg:grid-cols-3 gap-5">
            {(["parent", "student", "teacher"] as Role[]).map((role, i) => {
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
                    <div
                      className={`w-12 h-12 rounded-2xl ${role === "student"
                        ? "bg-yellow-50 text-yellow-600"
                        : role === "teacher"
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-sky-50 text-sky-600"
                        } flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-black">{content.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-stone-500">
                    {content.subtitle}
                  </p>

                  <ul className="mt-5 space-y-3">
                    {content.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-center gap-2.5 text-sm text-stone-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      if (role === "parent") {
                        openAuth("register");
                      } else if (role === "student") {
                        openAuth("login");
                      } else {
                        smoothScrollTo('actions-demo', 1100);
                      }
                    }}
                    className="mt-6 text-sm font-extrabold text-yellow-500 flex items-center gap-1"
                  >
                    {role === "student"
                      ? "Start Learning"
                      : role === "teacher"
                        ? "See How It Works"
                        : "Parent Login"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GAMIFICATION */}
      <section className="py-12 sm:py-14 bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">

            {/* 1st CARD (Left narrative & feature grid) */}
            <div className="reveal-on-scroll flex flex-col justify-between pl-1 sm:pl-2">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-amber-200 text-amber-700 text-xs font-bold shadow-2xs">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  Learning, but make it fun
                </div>
                <h2 className="mt-2.5 text-2xl sm:text-3xl lg:text-[2rem] xl:text-[2.15rem] font-black tracking-tight text-stone-900 leading-[1.2]">
                  Rewards that make children <br className="hidden sm:inline" />want to keep going
                </h2>
                <p className="mt-2 text-stone-600 text-xs sm:text-sm leading-relaxed text-justify [text-align-last:left]">
                  Correct answers earn points. Milestones unlock badges. Daily activity builds streaks. Students can see a friendly leaderboard and take short educational brain breaks.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  {
                    icon: '⭐',
                    title: 'Points',
                    text: 'Earn for correct answers',
                    cardBg: 'bg-gradient-to-br from-amber-100 via-amber-200/80 to-yellow-100/90 border-amber-300/90 shadow-amber-900/5',
                    iconBox: 'bg-white/90 border-amber-200/90 text-amber-700',
                    titleColor: 'text-amber-950',
                    textColor: 'text-amber-900/85',
                  },
                  {
                    icon: '🏆',
                    title: 'Badges',
                    text: 'Unlock subject milestones',
                    cardBg: 'bg-gradient-to-br from-purple-100 via-violet-200/80 to-fuchsia-100/90 border-purple-300/90 shadow-purple-900/5',
                    iconBox: 'bg-white/90 border-purple-200/90 text-purple-700',
                    titleColor: 'text-purple-950',
                    textColor: 'text-purple-900/85',
                  },
                  {
                    icon: '🔥',
                    title: 'Streaks',
                    text: 'Keep learning every day',
                    cardBg: 'bg-gradient-to-br from-rose-100 via-red-200/80 to-orange-100/90 border-rose-300/90 shadow-rose-900/5',
                    iconBox: 'bg-white/90 border-rose-200/90 text-rose-700',
                    titleColor: 'text-rose-950',
                    textColor: 'text-rose-900/85',
                  },
                  {
                    icon: '🥇',
                    title: 'Leaderboard',
                    text: 'See friendly rankings',
                    cardBg: 'bg-gradient-to-br from-sky-100 via-blue-200/80 to-cyan-100/90 border-sky-300/90 shadow-sky-900/5',
                    iconBox: 'bg-white/90 border-sky-200/90 text-sky-700',
                    titleColor: 'text-sky-950',
                    textColor: 'text-sky-900/85',
                  },
                ].map(({ icon, title, text, cardBg, iconBox, titleColor, textColor }) => (
                  <div
                    key={title}
                    className={`rounded-2xl border p-3.5 sm:p-4 shadow-sm group hover:-translate-y-0.5 hover:shadow-md transition-all ${cardBg}`}
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl border shadow-2xs mb-2 transition-transform group-hover:scale-105 ${iconBox}`}>
                      {icon}
                    </div>
                    <div className={`font-black text-xs sm:text-sm ${titleColor}`}>{title}</div>
                    <div className={`text-[11px] sm:text-xs font-semibold mt-0.5 leading-snug ${textColor}`}>{text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2nd CARD (Right Interactive Rewards Showcase) */}
            <div className="group/card relative rounded-2xl sm:rounded-3xl border border-amber-200 shadow-lg hover:shadow-xl p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden reveal-on-scroll flex flex-col justify-between h-full transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-36 h-36 bg-yellow-300 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

              {/* Header Section */}
              <div className="relative z-10 flex items-center justify-between shrink-0">
                <div>
                  <div className="text-[10px] sm:text-xs text-amber-700 font-bold uppercase tracking-wider">This Week</div>
                  <div className="text-lg sm:text-xl font-black text-stone-900 mt-0.5 group-hover/card:text-amber-700 transition-colors">
                    Rahul's Rewards
                  </div>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md shadow-yellow-500/25 transition-transform duration-300 group-hover/card:scale-105">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>

              {/* Reward items list */}
              <div className="relative z-10 flex-1 flex flex-col justify-between gap-2 mt-3.5 sm:mt-4">
                {[
                  [
                    "Correct answers",
                    "+120 XP",
                    "text-amber-600",
                    "bg-white/80 hover:bg-white",
                  ],
                  [
                    "7-day streak",
                    "+70 XP",
                    "text-amber-600",
                    "bg-white/80 hover:bg-white",
                  ],
                  [
                    "Geometry badge",
                    "Unlocked!",
                    "text-amber-600",
                    "bg-amber-100/60 hover:bg-amber-100",
                  ],
                  [
                    "Leaderboard",
                    "#3",
                    "text-amber-600",
                    "bg-white/80 hover:bg-white",
                  ],
                ].map(([label, value, color, bg]) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl ${bg} border border-white/80 shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer`}
                  >
                    <span className="text-xs sm:text-sm font-bold text-stone-700">{label}</span>
                    <span className={`text-xs sm:text-sm font-black ${color}`}>{value}</span>
                  </div>
                ))}

                {/* 5th Box: Brain Break */}
                <div className="px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200/60 shadow-xs">
                  <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-stone-900">
                    <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 animate-pulse shrink-0" />
                    <span>Brain Break</span>
                  </div>
                  <p className="text-[11px] sm:text-xs font-semibold text-stone-600 mt-0.5 leading-tight">
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
            <h2
              className="mt-4 text-3xl sm:text-4xl font-black tracking-normal capitalize"
              style={{ wordSpacing: "0.25em" }}
            >
              UNBOX THE FUTURE OF GRADING
            </h2>
            <p className="mt-3 text-stone-600">
              Try a sample student attempt and see how the platform gives useful
              feedback.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2 reveal-on-scroll">
            {(["math", "science"] as const).map((subject) => (
              <button
                key={subject}
                onClick={() => runDemo(subject)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold ${selectedSubject === subject
                  ? "bg-yellow-400 text-stone-900"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
              >
                {subject === "math" ? "📐 Class 10 Math" : "🧬 Class 8 Science"}
              </button>
            ))}
          </div>

          <div className="mt-7 grid lg:grid-cols-2 gap-5 reveal-on-scroll">
            <div className="rounded-3xl bg-stone-50 border border-stone-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500">
                    {currentQuestion.grade}
                  </div>
                  <h3 className="font-black text-lg">
                    {currentQuestion.subject}
                  </h3>
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
                      ? "bg-white border-yellow-400 text-yellow-700"
                      : "bg-white border-stone-200 text-stone-600"
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
                    <div className="font-black text-sm">
                      Study Buddy Analysis
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Step-by-step feedback
                    </div>
                  </div>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl text-sm font-black ${currentAttempt.score >= 9
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-yellow-50 text-amber-700"
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
                        className={`text-xs font-black ${pass ? "text-yellow-600" : "text-rose-600"
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

      {/* CURRICULUM & LEARNING TRACKS */}
      <section
        id="curriculum-tracks"
        className="relative py-24 bg-gradient-to-b from-stone-50/70 via-white to-amber-50/20 overflow-hidden"
      >
        {/* Subtle Decorative Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-b from-amber-200/25 via-amber-100/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* CENTERED HEADER */}
          <div className="text-center max-w-3xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-300/60 text-amber-900 text-xs font-extrabold shadow-2xs mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Tailored Academic Tracks</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-normal text-stone-900 capitalize"
              style={{ wordSpacing: "0.25em" }}
            >
              CHOOSE THE LEARNING TRACK{" "}
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                THAT FITS
              </span>
            </h2>
            <p className="mt-3.5 text-stone-600 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
              Comprehensive, syllabus-accurate practice for school board
              excellence. Complete with
              NCERT solutions, previous year papers, and instant step
              feedback.
            </p>

            {/* Quick Value Highlights Strip */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-stone-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                Latest 2025–26 Pattern
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                Past 10-Yr Solved Papers
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                Step-by-Step Evaluation
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Free Tier Included
              </span>
            </div>
          </div>

          {/* RICH INTERACTIVE TRACKS GRID */}
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: "cbse-10",
                title: "CBSE Board",
                level: "Class 10",
                popularTag: "Most Popular",
                subtitle: "Board Exam & NCERT Practice",
                description:
                  "Master core concepts with line-by-line NCERT solutions, chapter-wise question banks, and official marking rubrics.",
                icon: BookOpen,
                theme: {
                  cardBorder: "border-amber-200/90 hover:border-amber-400",
                  badgeBg: "bg-amber-100/90 text-amber-900 border-amber-300/80",
                  iconGrad:
                    "from-amber-400 via-amber-500 to-orange-500 shadow-amber-500/30",
                  glow: "hover:shadow-amber-500/15",
                  accentHover: "group-hover:text-amber-600",
                  checkColor: "text-amber-600",
                  actionBtn:
                    "bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-950",
                },
                features: [
                  "Complete NCERT & Exemplar Solutions",
                  "Past 10 Years Solved Papers (PYQs)",
                  "Step-by-Step Evaluation Rubric",
                ],
                subjects: [
                  "Mathematics",
                  "Science",
                  "Social Science",
                  "English",
                ],
                stats: {
                  questions: "15,000+",
                  mockTests: "12 Full Mocks",
                  passRate: "98.4%",
                },
                sampleTopics: [
                  "Quadratic Equations & Arithmetic Progressions",
                  "Light: Reflection, Refraction & Human Eye",
                  "Life Processes, Reproduction & Heredity",
                  "Real-world Case Study & Competency Questions",
                ],
                board: "CBSE",
                classGrade: "Class 10",
                defaultSubject: "Mathematics",
              },
              {
                id: "cbse-isc-12",
                title: "CBSE & ISC Senior",
                level: "Class 12",
                popularTag: "Pre-University",
                subtitle: "Advanced Board & CUET Prep",
                description:
                  "In-depth derivations, formula vaults, specimen board papers, and conceptual bridge training for CUET & entrance tests.",
                icon: GraduationCap,
                theme: {
                  cardBorder: "border-sky-200/90 hover:border-sky-400",
                  badgeBg: "bg-sky-100/90 text-sky-900 border-sky-300/80",
                  iconGrad:
                    "from-sky-400 via-blue-500 to-indigo-600 shadow-sky-500/30",
                  glow: "hover:shadow-sky-500/15",
                  accentHover: "group-hover:text-sky-600",
                  checkColor: "text-sky-600",
                  actionBtn: "bg-stone-900 hover:bg-sky-600 text-white",
                },
                features: [
                  "Complete Derivations & Formula Vault",
                  "Official Specimen & Model Mock Papers",
                  "CUET & Board Dual Readiness Drills",
                ],
                subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
                stats: {
                  questions: "20,000+",
                  mockTests: "15 Full Mocks",
                  passRate: "99.1%",
                },
                sampleTopics: [
                  "Calculus, Integrals & Differential Equations",
                  "Electrostatics, Magnetism & Wave Optics",
                  "Organic Reaction Mechanisms & Kinetics",
                  "Genetics, Molecular Biology & Biotechnology",
                ],
                board: "CBSE",
                classGrade: "Class 12",
                defaultSubject: "Physics",
              },
              {
                id: "icse-10",
                title: "ICSE Board",
                level: "Class 10",
                popularTag: "In-Depth Theory",
                subtitle: "ICSE Exam & Subject Practice",
                description:
                  "Comprehensive syllabus coverage mapped to Selina & Concise textbooks with structured subjective evaluation & diagrams.",
                icon: FileText,
                theme: {
                  cardBorder: "border-rose-200/90 hover:border-rose-400",
                  badgeBg: "bg-rose-100/90 text-rose-900 border-rose-300/80",
                  iconGrad:
                    "from-rose-400 via-pink-500 to-purple-600 shadow-rose-500/30",
                  glow: "hover:shadow-rose-500/15",
                  accentHover: "group-hover:text-rose-600",
                  checkColor: "text-rose-600",
                  actionBtn: "bg-stone-900 hover:bg-rose-600 text-white",
                },
                features: [
                  "Selina & Concise Textbook Mapping",
                  "Structured Subjective Theory Rubrics",
                  "Diagram & Practical Question Banks",
                ],
                subjects: [
                  "Maths",
                  "Physics",
                  "Chemistry",
                  "Biology",
                  "English",
                ],
                stats: {
                  questions: "14,000+",
                  mockTests: "10 Full Mocks",
                  passRate: "97.8%",
                },
                sampleTopics: [
                  "Commercial Mathematics: GST & Banking",
                  "Force, Work, Power & Sound Waves",
                  "Periodic Properties & Chemical Bonding",
                  "Plant Physiology & Circulatory System",
                ],
                board: "ICSE",
                classGrade: "Class 10",
                defaultSubject: "Mathematics",
              },
              {
                id: "competitive-prep",
                title: "Competitive Prep",
                level: "HOTS / Foundation",
                popularTag: "High Rigor",
                subtitle: "Challenging Practice & Drills",
                description:
                  "Higher-order thinking skills, Olympiad question sets, NTSE speed drills, and early bridge foundations for JEE & NEET.",
                icon: Sparkles,
                theme: {
                  cardBorder: "border-emerald-200/90 hover:border-emerald-400",
                  badgeBg:
                    "bg-emerald-100/90 text-emerald-900 border-emerald-300/80",
                  iconGrad:
                    "from-emerald-400 via-teal-500 to-teal-700 shadow-emerald-500/30",
                  glow: "hover:shadow-emerald-500/15",
                  accentHover: "group-hover:text-emerald-600",
                  checkColor: "text-emerald-600",
                  actionBtn: "bg-stone-900 hover:bg-emerald-600 text-white",
                },
                features: [
                  "Multi-Concept HOTS Problems",
                  "Olympiad & NTSE Speed Drills",
                  "National Percentile Benchmark Tests",
                ],
                subjects: [
                  "Advanced Maths",
                  "Science HOTS",
                  "Aptitude & Logic",
                ],
                stats: {
                  questions: "12,000+",
                  mockTests: "20 Speed Drills",
                  passRate: "Top 5%",
                },
                sampleTopics: [
                  "Non-Routine Algebraic Olympiad Challenges",
                  "Multi-Concept Kinematics & Mechanics",
                  "Logical Reasoning & Mathematical Induction",
                  "Real-time Percentile & Accuracy Analytics",
                ],
                board: "CBSE",
                classGrade: "Class 10",
                defaultSubject: "Mathematics",
              },
            ].map((track) => {
              return (
                <div
                  key={track.id}
                  onClick={() => navigate('/quick-test')}
                  className={`group relative flex flex-col justify-between bg-white rounded-3xl border ${track.theme.cardBorder} p-6 shadow-sm hover:shadow-2xl ${track.theme.glow} hover:-translate-y-2 transition-all duration-300 cursor-pointer`}
                >
                  {/* Top Row: Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${track.theme.badgeBg} shadow-2xs`}>
                        {track.level}
                      </span>
                      {track.popularTag && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-800 border border-amber-300/60 shadow-2xs">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          {track.popularTag}
                        </span>
                      )}
                    </div>

                    {/* Titles */}
                    <h3
                      className={`mt-5 font-black text-stone-900 text-lg sm:text-xl tracking-tight ${track.theme.accentHover} transition-colors`}
                    >
                      {track.title}
                    </h3>
                    <div className="text-xs font-bold text-stone-600 mt-1">
                      {track.subtitle}
                    </div>
                    <p className="mt-2 text-xs text-stone-500 leading-relaxed font-normal">
                      {track.description}
                    </p>

                    {/* Key Features List */}
                    <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
                      {track.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-2 text-xs font-medium text-stone-700"
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${track.theme.checkColor} shrink-0 mt-0.5`}
                          />
                          <span className="leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Subject Pills */}
                    <div className="mt-4 pt-3 border-t border-stone-100/90 flex flex-wrap gap-1.5">
                      {track.subjects.map((sub) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-stone-100 text-stone-600 group-hover:bg-stone-200/70 transition-colors"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-6 pt-4 border-t border-stone-100/90 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/quick-test');
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl ${track.theme.actionBtn} font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all duration-200 cursor-pointer`}
                    >
                      <span>Start Free Practice</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* HIGH-CONVERTING BOTTOM CTA BAR */}
          <div className="mt-14 text-center flex flex-col items-center reveal-on-scroll">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            </div>

            {/* TRUST BADGES */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs font-semibold text-stone-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> No credit
                card required
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" /> Instant step-by-step grading
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" /> Latest 2025–26
                CBSE & ICSE syllabus
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" /> Free test included
              </span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE TRACK PREVIEW MODAL */}
        {previewTrack && createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setPreviewTrack(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${previewTrack.theme.iconGrad} flex items-center justify-center text-white shadow-md`}
                  >
                    {React.createElement(previewTrack.icon, {
                      className: "w-6 h-6 stroke-[2.2]",
                    })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-stone-900">
                        {previewTrack.title}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${previewTrack.theme.badgeBg}`}
                      >
                        {previewTrack.level}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-stone-500 mt-0.5">
                      {previewTrack.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewTrack(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Tiles */}
              <div className="grid grid-cols-3 gap-3 my-5">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                  <div className="text-lg font-black text-stone-900">
                    {previewTrack.stats.questions}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500">
                    Practice Questions
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                  <div className="text-lg font-black text-stone-900">
                    {previewTrack.stats.mockTests}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500">
                    Mock Assessments
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                  <div className="text-lg font-black text-amber-600">
                    {previewTrack.stats.passRate}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500">
                    Benchmark Score
                  </div>
                </div>
              </div>

              {/* Subjects Covered */}
              <div className="mb-5">
                <div className="text-xs font-black uppercase tracking-wider text-stone-400 mb-2">
                  Subjects Included
                </div>
                <div className="flex flex-wrap gap-2">
                  {previewTrack.subjects.map((sub: string) => (
                    <span
                      key={sub}
                      className="px-3 py-1.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs font-bold"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Topics & Syllabus Highlights */}
              <div className="mb-6">
                <div className="text-xs font-black uppercase tracking-wider text-stone-400 mb-2">
                  Core Topics & Syllabus Highlights
                </div>
                <div className="space-y-2">
                  {previewTrack.sampleTopics.map((topic: string) => (
                    <div
                      key={topic}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100/90 text-xs font-semibold text-stone-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal CTAs */}
              <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewTrack(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewTrack(null);
                    openAuth("register", "student");
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <span>Start Free in {previewTrack.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
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
            <h2
              className="mt-6 text-4xl sm:text-5xl font-black tracking-normal text-stone-900 capitalize"
              style={{ wordSpacing: "0.25em" }}
            >
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
                  className={`bg-white/80 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden ${open
                    ? "border-yellow-300 shadow-xl shadow-yellow-500/10"
                    : "border-stone-200 hover:border-yellow-200 hover:shadow-md"
                    }`}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="w-full p-6 flex items-center justify-between gap-4 text-left font-bold text-stone-800 cursor-pointer"
                  >
                    <span className="text-lg text-stone-900">{faq.q}</span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${open
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-stone-100 text-stone-400"
                        }`}
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      />
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
      <PublicFooter
        isBackendOnline={isBackendOnline ?? undefined}
        onQuickDemo={onQuickDemo}
      />
    </div>
  );
};
