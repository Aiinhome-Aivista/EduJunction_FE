import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PublicHeader } from "./common/PublicHeader";
import { PublicFooter } from "./common/PublicFooter";
import { BackToTopButton } from "./common/BackToTopButton";
import { WhyEduJunctionSection } from "./landing/WhyEduJunctionSection";
import { FaqSection } from "./landing/FaqSection";
import { ActionsDemoSection } from "./landing/ActionsDemoSection";
import { PersonasSection } from "./landing/PersonasSection";
import { FeaturesSection } from "./landing/FeaturesSection";
import { GamificationSection } from "./landing/GamificationSection";
import { InteractiveDemoSection } from "./landing/InteractiveDemoSection";
import { HeroSection } from "./landing/HeroSection";
import { FreeMockPapersSection } from "./landing/FreeMockPapersSection";
import { MagicWordArenaSection } from "./landing/MagicWordArenaSection";
import { CurriculumTracksSection } from "./landing/CurriculumTracksSection";
import {
  GraduationCap,
  Users,
  BookOpen,
  X,
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
  const [mobileFeaturesExpanded, setMobileFeaturesExpanded] = useState(false);

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
      const persona = location.search.includes("role=student") ? "student" : "parent";
      openAuth("register", persona);
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

  const smoothScrollTo = (targetId: string, duration = 950) => {
    const el = document.getElementById(targetId);
    if (!el) return;

    // Temporarily pause PublicHeader URL tracking so it doesn't jitter during smooth glide
    (window as any).__disableUrlSyncUntil = Date.now() + duration + 300;
    if (window.location.pathname === '/actions-demo') {
      window.history.replaceState(null, '', '/');
    }

    const header = document.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height : 72;
    const targetY = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16);
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    // Luxurious smooth cubic easeInOut curve for gentle pickup and velvety smooth arrival
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
  const [wrongLetterIdx, setWrongLetterIdx] = useState<number | null>(null);

  const activeWordObj = ACADEMIC_WORDS[currentWordIndex] || ACADEMIC_WORDS[0];

  const loadWord = (index: number) => {
    const word = ACADEMIC_WORDS[index].word;
    setUserLetters([]);
    setUsedOptionIndices([]);
    setIsWordComplete(false);
    setShowSecretHint(false);
    setWrongLetterIdx(null);

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
    } else {
      setWrongLetterIdx(optionIdx);
      setTimeout(() => setWrongLetterIdx(null), 450);
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
    loadWord(nextIdx);
  };

  const resetCurrentWord = () => {
    loadWord(currentWordIndex);
  };

  // Desktop physical keyboard listener for Concept Arena
  useEffect(() => {
    const handleArenaKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;
      if (previewTrack || activeFeatureModal) return;

      if (e.key === 'Backspace') {
        handleUndoLetter();
        return;
      }

      if (e.key === 'Enter' && isWordComplete) {
        nextWord();
        return;
      }

      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key) && !isWordComplete) {
        const char = e.key.toUpperCase();
        const optIdx = shuffledOptions.findIndex(
          (letter, idx) => letter === char && !usedOptionIndices.includes(idx)
        );
        if (optIdx !== -1) {
          handleLetterClick(char, optIdx);
        }
      }
    };

    window.addEventListener('keydown', handleArenaKeyDown);
    return () => window.removeEventListener('keydown', handleArenaKeyDown);
  }, [shuffledOptions, usedOptionIndices, userLetters, isWordComplete, activeWordObj, previewTrack, activeFeatureModal]);

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
        .hero-grid {
          background-image:
            linear-gradient(to right, rgba(120, 113, 108, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(120, 113, 108, 0.12) 1px, transparent 1px);
          background-size: 56px 56px;
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, #000 20%, transparent 80%);
                  mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, #000 20%, transparent 80%);
        }
      `}</style>
      {/* FIXED NAVBAR (Only the header stays fixed if needed) */}
      <div className="fixed top-0 left-0 right-0 z-50 shadow-sm bg-white">
        <PublicHeader onOpenAuth={openAuth} />
      </div>

      <HeroSection onOpenAuth={openAuth} onScrollTo={smoothScrollTo} onNavigate={navigate} />

      <ActionsDemoSection />

      <FreeMockPapersSection onOpenAuth={openAuth} />

      <MagicWordArenaSection
        activeWordObj={activeWordObj}
        currentWordIndex={currentWordIndex}
        userLetters={userLetters}
        usedOptionIndices={usedOptionIndices}
        shuffledOptions={shuffledOptions}
        isWordComplete={isWordComplete}
        showSecretHint={showSecretHint}
        wrongLetterIdx={wrongLetterIdx}
        handleLetterClick={handleLetterClick}
        handleUndoLetter={handleUndoLetter}
        nextWord={nextWord}
        resetCurrentWord={resetCurrentWord}
        setShowSecretHint={setShowSecretHint}
      />

      <FeaturesSection
        mobileFeaturesExpanded={mobileFeaturesExpanded}
        setMobileFeaturesExpanded={setMobileFeaturesExpanded}
        activeFeatureModal={activeFeatureModal}
        onSetActiveFeatureModal={setActiveFeatureModal}
        demoMcqSelected={demoMcqSelected}
        onSetDemoMcqSelected={setDemoMcqSelected}
        onOpenAuth={openAuth}
      />

      <WhyEduJunctionSection />

      <PersonasSection activeRole={activeRole} roleContent={roleContent} onOpenAuth={openAuth} onScrollToDemo={() => smoothScrollTo("actions-demo", 950)} />

      <GamificationSection />

      <InteractiveDemoSection
        demoQuestions={demoQuestions}
        selectedSubject={selectedSubject}
        selectedAttempt={selectedAttempt}
        setSelectedAttempt={setSelectedAttempt}
        isEvaluating={isEvaluating}
        setIsEvaluating={setIsEvaluating}
        runDemo={runDemo}
        currentQuestion={currentQuestion}
        currentAttempt={currentAttempt}
      />

      <CurriculumTracksSection
        previewTrack={previewTrack}
        onSetPreviewTrack={setPreviewTrack}
        onOpenAuth={openAuth}
        onNavigate={navigate}
      />

      <FaqSection faqs={faqs} openFaq={openFaq} onOpenChange={setOpenFaq} />

      {/* FOOTER */}
      <PublicFooter
        isBackendOnline={isBackendOnline ?? undefined}
        onQuickDemo={onQuickDemo}
      />
      <BackToTopButton mobileOnly />
    </div>
  );
};
