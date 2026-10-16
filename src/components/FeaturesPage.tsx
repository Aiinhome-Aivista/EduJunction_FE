import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  BookOpen,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Users,
  GraduationCap,
  Clock,
  Layers,
  BarChart3,
  Flame,
  FileText,
  Gamepad2,
  Check,
  X,
  Target,
  ChevronRight,
  Brain,
  BrainCircuit,
  MessageSquare,
  FileDown,
} from 'lucide-react';
import { PublicHeader } from './common/PublicHeader';
import { PublicFooter } from './common/PublicFooter';
import { LoginPage } from './LoginPage';

export const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth modal state for quick login/signup anywhere on the page
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
    defaultRole?: 'parent' | 'student';
  }>({
    isOpen: false,
    mode: 'login',
    defaultRole: 'student',
  });

  const openAuth = (mode: 'login' | 'register' = 'register', role: 'parent' | 'student' = 'student') => {
    setAuthModal({ isOpen: true, mode, defaultRole: role });
  };

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

    document.querySelectorAll('.reveal-on-scroll').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (location.hash !== '#personalization') return;
    const timer = window.setTimeout(() => {
      const section = document.getElementById('personalization');
      if (!section) return;
      const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 72;
      const top = section.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-clip flex flex-col justify-between">
      {/* Header */}
      <PublicHeader onOpenAuth={openAuth} />

      <main className="flex-1">
        {/* ============================================================== */}
        {/* HERO SECTION                                                   */}
        {/* ============================================================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-50/80 via-white to-stone-50 min-h-screen flex flex-col justify-center border-b border-amber-200/40 py-4">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-yellow-200/40 blur-3xl pointer-events-none" />
          <div className="absolute top-48 -left-32 w-80 h-80 rounded-full bg-amber-200/35 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-950 text-xs font-black mb-3 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
              <span>EduJunction Capabilities & Architecture</span>
            </div>

            {/* Main Headline with Word Spacing */}
            <h1
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-normal [word-spacing:0.25em] leading-[1.15] max-w-4xl mx-auto uppercase"
              style={{ wordSpacing: '0.25em' }}
            >
              EVERY TOOL YOU NEED TO{' '}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                MASTER YOUR SYLLABUS
              </span>
            </h1>

            <p className="mt-2 text-stone-700 text-xs sm:text-sm lg:text-base font-medium max-w-3xl mx-auto leading-relaxed">
              From instant 0.05s step grading and 2027 curriculum-verified model papers to adaptive learning paths and parent dossiers — explore the architecture engineered for academic excellence.
            </p>

            {/* Persona cards */}
            <div className="mt-5 max-w-7xl mx-auto grid md:grid-cols-2 xl:grid-cols-3 gap-4 text-left">
              <article className="h-full rounded-2xl bg-white border border-amber-200/90 p-4 sm:p-5 shadow-xl shadow-amber-500/5">
                <div className="grid gap-4 items-center">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      For Independent Learners
                    </span>
                    <h3 className="mt-2 text-base sm:text-lg font-black text-stone-900">
                      Learn Smarter with Zero-Stress Feedback
                    </h3>
                    <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                      Practice questions tailored strictly to CBSE, ICSE & ISC exam patterns. Receive instantaneous step marks, concept explanations, and earn XP to climb the school leaderboard.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">⚡ 0.05s Instant Evaluation</span>
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">🔥 Streak Multipliers</span>
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">🎮 Magic Word Arena</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                      <span>CBSE Class 10 • Quadratic Equations</span>
                      <span className="text-emerald-600 font-black">94% Accuracy</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                    <p className="text-[11px] text-stone-500 italic">
                      "Step 2: Correct discriminant calculation (b² - 4ac = 16). Full 3/3 marks awarded with verified rubric."
                    </p>
                  </div>
                </div>
              </article>
              <article className="h-full rounded-2xl bg-white border border-sky-200/90 p-4 sm:p-5 shadow-xl shadow-sky-500/5">
                <div className="grid gap-4 items-center">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300">
                      For Connected Parents
                    </span>
                    <h3 className="mt-2 text-base sm:text-lg font-black text-stone-900">
                      Real-Time Insight Without Micromanagement
                    </h3>
                    <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                      Stay informed of your child's syllabus completion, strengths, and trouble spots. Schedule weekend mock tests and download one-click WhatsApp/Email performance dossiers.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">📱 WhatsApp Score Alerts</span>
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">🗓️ Exam Scheduler</span>
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">📊 Shareable Dossier</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-950">
                      <ShieldCheck className="w-4 h-4 text-sky-600" />
                      <span>Parent Performance Dossier • Generated Today</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-sky-200/80 text-xs space-y-1">
                      <div className="font-black text-stone-900">Rohan Kumar (Class 10 - CBSE)</div>
                      <div className="text-stone-600">Total Practice Tests: 18 • Syllabus Coverage: 82%</div>
                      <div className="text-amber-700 font-bold">Suggested Focus: Light Reflection Ray Diagrams</div>
                    </div>
                  </div>
                </div>
              </article>
              <article className="h-full rounded-2xl bg-white border border-purple-200/90 p-4 sm:p-5 shadow-xl shadow-purple-500/5">
                <div className="grid gap-4 items-center">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
                      Your Study Buddy
                    </span>
                    <h3 className="mt-2 text-base sm:text-lg font-black text-stone-900">
                      24x7 Guide, Ready Whenever You Are
                    </h3>
                    <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                      EduJunction's guide each learner through practice, explains mistakes, and recommends what to study next. It adapts to each student's progress, offering focused support whenever they need it.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">🎯 Personalized next steps</span>
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">📚 Practice and explanations</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                      <span>Study Buddy • Learning Support</span>
                      <span className="text-purple-700 font-black">Available 24/7</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-purple-200/80 text-xs space-y-1">
                      <div className="font-black text-stone-900">Next step: Review angle properties</div>
                      <div className="text-stone-600">Recommended after the learner's geometry practice results.</div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/quick-test')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-stone-950 font-black text-sm shadow-amber-500/20 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-stone-950" />
                <span>Try Instant 5-Min Quick Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 text-stone-800 font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View All Subscription & Pricing Plans</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* CORE CAPABILITY PILLARS (5 DEEP-DIVE CARDS)                    */}
        {/* ============================================================== */}
        <section className="min-h-screen flex flex-col justify-center py-6 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center max-w-3xl mx-auto mb-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-2">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>Core Architectural Modules</span>
              </div>
              <h2
                className="mt-2 text-2xl sm:text-3xl font-black text-stone-900 tracking-normal [word-spacing:0.2em] uppercase"
                style={{ wordSpacing: '0.2em' }}
              >
                THE 5 PILLARS OF EDUJUNCTION
              </h2>
              <p className="mt-2 text-stone-600 text-xs sm:text-sm font-medium">
                Engineered from the ground up to replace guesswork with data-driven academic mastery.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {/* Pillar 1 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-amber-200/80 hover:border-amber-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-md shadow-amber-400/30 mb-3">
                    <Zap className="w-5 h-5 fill-stone-950" />
                  </div>
                  <h3 className="text-base font-black text-stone-900">1. Instant 0.05s Diagnostic & Step Marking</h3>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    Powered by verified question database architecture. Answers are evaluated line-by-line using official CBSE/ICSE marking rubrics.
                  </p>
                  <ul className="mt-2.5 space-y-1.5 text-xs font-medium text-stone-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant 0.05s question loading</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Subjective step marking with partial credit detection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Pinpoints exact formula error or misconception</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-200/80">
                  <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider">Speed: 0.05s Load Time</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-sky-200/80 hover:border-sky-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black shadow-md shadow-sky-500/30 mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-stone-900">2. Official 2027 Model Exam Papers</h3>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    Exact replica board examination blueprints. Section A to E breakdown including Case Studies, Assertion-Reasoning, and practicals.
                  </p>
                  <ul className="mt-2.5 space-y-1.5 text-xs font-medium text-stone-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>Full 3-Hour (180 mins) Board Exam Simulation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>Downloadable Offline PDF question & answer papers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>Official blueprint conformity for CBSE, ICSE & ISC</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-200/80">
                  <span className="text-[11px] font-black uppercase text-sky-700 tracking-wider">Format: Digital & PDF Print</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-emerald-200/80 hover:border-emerald-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/30 mb-3">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-stone-900">3. Adaptive Learning & 24/7 Study Buddy</h3>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    No two students have the same struggle. When a student falters in Trigonometry, the platform dynamically generates bridging concepts.
                  </p>
                  <ul className="mt-2.5 space-y-1.5 text-xs font-medium text-stone-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Dynamic concept path re-routing based on diagnostics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Study Buddy available for doubt clarification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Targeted remedial revision modules</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-200/80">
                  <span className="text-[11px] font-black uppercase text-emerald-700 tracking-wider">Personalized: 1-on-1 Calibration</span>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-purple-200/80 hover:border-purple-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-black shadow-md shadow-purple-500/30 mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-stone-900">4. The Tri-Bridge Ecosystem</h3>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    Unites student, parent, and teacher into a single synchronized feedback loop without awkward WhatsApp groups or phone tags.
                  </p>
                  <ul className="mt-2.5 space-y-1.5 text-xs font-medium text-stone-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Live WhatsApp / Email test completion alerts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Parent Exam Scheduler with custom time caps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Direct PTM communication and progress dossier</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-200/80">
                  <span className="text-[11px] font-black uppercase text-purple-700 tracking-wider">Sync: Student • Parent • Teacher</span>
                </div>
              </div>

              {/* Pillar 5 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 border border-rose-200/80 hover:border-rose-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black shadow-md shadow-rose-500/30 mb-3">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-stone-900">5. FunZone & Concept Gamification</h3>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    Turn monotonous studying into healthy competition. Magic Word Arena, concept crossword challenges, and XP leaderboards keep students motivated.
                  </p>
                  <ul className="mt-2.5 space-y-1.5 text-xs font-medium text-stone-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Magic Word Arena: Build scientific & literary vocabulary</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Streak Flame: Consistency rewards that build daily habits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Badge Hall of Fame: Unlock bronze, silver & gold honors</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-200/80">
                  <span className="text-[11px] font-black uppercase text-rose-700 tracking-wider">Engagement: 3.4x Higher Retention</span>
                </div>
              </div>

              {/* Pillar 6: Verification Guarantee */}
              <div className="p-4 sm:p-5 rounded-2xl bg-yellow-400 text-stone-950 border border-amber-300 hover:bg-amber-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-stone-950 text-amber-400 flex items-center justify-center font-black shadow-md mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black">100% Curriculum Accuracy Guarantee</h3>
                  <p className="mt-1.5 text-xs font-semibold text-stone-900 leading-relaxed">
                    Every question, marking guideline, and derivation in our repository is cross-checked against official NCERT, Selina, and Council specimen papers.
                  </p>
                  <div className="mt-3 p-2.5 rounded-xl bg-stone-950/15 border border-stone-950/20 text-xs font-bold space-y-1">
                    <div>✓ Zero hallucination risk</div>
                    <div>✓ Updated to latest 2025–26 official blueprints</div>
                    <div>✓ Verified by experienced board evaluators</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-950/20">
                  <button
                    type="button"
                    onClick={() => openAuth('register')}
                    className="w-full py-2 px-4 rounded-xl bg-stone-950 hover:bg-stone-900 text-yellow-400 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Start Free Student Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* PERSONALIZATION EXAMPLE */}
      <section id="personalization" className="min-h-screen flex flex-col justify-center py-6 bg-white relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
              <Brain className="w-3.5 h-3.5" />
              Study Buddy Personalization
            </div>
            <h2
              className="mt-3 text-2xl sm:text-3xl font-black tracking-normal capitalize"
              style={{ wordSpacing: '0.25em' }}
            >
              NOT THE SAME LESSON FOR EVERYONE
            </h2>
            <p className="mt-2 text-stone-600 text-sm">
              Example: Rahul struggles with Geometry, so the platform changes his next steps.
            </p>
          </div>

          <div className="mt-6 relative">
            <style>{`
              @keyframes float-card {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-6px); }
              }
              .animate-float-card {
                animation: float-card 4s ease-in-out infinite;
              }
            `}</style>

            <div className="hidden lg:block absolute top-1/2 left-[5%] right-[5%] h-1 bg-gradient-to-r from-blue-200 via-purple-300 to-green-300 -translate-y-1/2 rounded-full opacity-60"></div>

            <div className="grid lg:grid-cols-5 gap-4 lg:gap-3 relative z-10">
              {[
                ['📝', 'Assessment', 'Rahul scores 60%', 'bg-blue-100 border-blue-200', 'text-blue-700', 'lg:-translate-y-3'],
                ['🔍', 'Study Buddy Finds', 'Geometry is weak', 'bg-red-100 border-red-200', 'text-red-700', 'lg:translate-y-3'],
                ['📚', 'Recommends', 'Lesson + practice', 'bg-purple-100 border-purple-200', 'text-purple-700', 'lg:-translate-y-3'],
                ['🎯', 'Retest', 'Mini mock exam', 'bg-orange-100 border-orange-200', 'text-orange-700', 'lg:translate-y-3'],
                ['🎉', 'Improves', '60% → 82%', 'bg-green-100 border-green-200', 'text-green-700', 'lg:-translate-y-3'],
              ].map(([icon, title, text, colorClass, textClass, offsetClass], i) => (
                <div key={title} className={`relative flex flex-col items-center group ${offsetClass} reveal-on-scroll`} style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="animate-float-card w-full">
                    <div className="transition-transform hover:-translate-y-2 duration-300 relative">
                      <div className="absolute inset-0 bg-white/40 blur-xl rounded-full group-hover:bg-yellow-400/20 transition-colors"></div>

                      <div className={`relative w-full h-[148px] p-4 sm:p-5 lg:p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-white shadow-xl shadow-stone-200/50 flex flex-col items-center justify-center text-center z-10 overflow-hidden`}>
                        <div className={`absolute top-0 right-0 w-20 h-20 ${colorClass} blur-3xl opacity-50 rounded-full -mr-8 -mt-8`}></div>

                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClass} shadow-sm border border-white/50 mb-3 relative z-10`}>
                          {icon}
                        </div>
                        <h3 className={`h-6 flex items-center justify-center font-black text-sm ${textClass} mb-1 relative z-10`}>{title}</h3>
                        <p className="min-h-4 text-xs font-semibold text-stone-500 relative z-10">{text}</p>
                      </div>
                    </div>
                  </div>

                  {i < 4 && <div className="lg:hidden w-1 h-6 bg-gradient-to-b from-stone-200 to-stone-300 rounded-full my-1.5"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 relative overflow-hidden rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-amber-50 p-5 sm:p-6 shadow-xl shadow-yellow-500/10 reveal-on-scroll">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-yellow-300 rounded-full blur-[60px] opacity-40"></div>
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-amber-400 rounded-full blur-[60px] opacity-20"></div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
              <div className="relative w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30" aria-label="High ability student thinking badge">
                <Brain className="w-7 h-7" strokeWidth={1.75} />
                <span className="absolute right-1.5 top-0.5 text-xs font-black leading-none">+</span>
                <span className="absolute right-1 top-3.5 h-1.5 w-1.5 rounded-full bg-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900">Advanced students get harder content.</h3>
                <p className="mt-1.5 text-stone-600 font-medium text-sm leading-relaxed max-w-3xl text-justify [text-align-last:left]">
                  If a student consistently performs strongly, the platform dynamically adapts, moving them to <strong className="font-bold text-amber-700">HOTS (Higher Order Thinking Skills)</strong> questions, challenge quizzes, and advanced mock exams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* ============================================================== */}
        {/* ARCHITECTURE COMPARISON TABLE                                  */}
        {/* ============================================================== */}
        <section className="py-20 bg-stone-50 border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2
                className="text-2xl sm:text-4xl font-black text-stone-900 tracking-normal [word-spacing:0.2em] uppercase"
                style={{ wordSpacing: '0.2em' }}
              >
                HOW EDUJUNCTION COMPARES
              </h2>
              <p className="mt-2.5 text-stone-600 text-xs sm:text-sm font-medium">
                See why students and parents switch to EduJunction from conventional options.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-stone-200 bg-white shadow-md">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-900 font-black">
                    <th className="p-4 sm:p-5">Feature & Capability</th>
                    <th className="p-4 sm:p-5 bg-amber-100/70 text-amber-950 border-x border-amber-200/80">
                      EduJunction Platform
                    </th>
                    <th className="p-4 sm:p-5 text-stone-600">Traditional Coaching</th>
                    <th className="p-4 sm:p-5 text-stone-600">Generic Test Sites</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-stone-900">Grading Turnaround Time</td>
                    <td className="p-4 sm:p-5 bg-amber-50/50 font-black text-emerald-700 border-x border-amber-100">
                      ⚡ Instant (0.05s)
                    </td>
                    <td className="p-4 sm:p-5">3–7 Days Delayed</td>
                    <td className="p-4 sm:p-5">Only MCQs instant</td>
                  </tr>

                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-stone-900">Step Marking & Partial Credit</td>
                    <td className="p-4 sm:p-5 bg-amber-50/50 font-black text-emerald-700 border-x border-amber-100">
                      ✓ Full step-by-step breakdown
                    </td>
                    <td className="p-4 sm:p-5">Subject to teacher mood</td>
                    <td className="p-4 sm:p-5">✗ None (Binary Right/Wrong)</td>
                  </tr>

                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-stone-900">2027 Specimen Blueprint Accuracy</td>
                    <td className="p-4 sm:p-5 bg-amber-50/50 font-black text-emerald-700 border-x border-amber-100">
                      ✓ 100% Council Verified
                    </td>
                    <td className="p-4 sm:p-5">Varies widely</td>
                    <td className="p-4 sm:p-5">Outdated question banks</td>
                  </tr>

                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-stone-900">Live Parent Progress Alerts</td>
                    <td className="p-4 sm:p-5 bg-amber-50/50 font-black text-emerald-700 border-x border-amber-100">
                      ✓ WhatsApp / Email Dossier
                    </td>
                    <td className="p-4 sm:p-5">Quarterly PTMs only</td>
                    <td className="p-4 sm:p-5">✗ No parent portal</td>
                  </tr>

                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-stone-900">Cost & Transparency</td>
                    <td className="p-4 sm:p-5 bg-amber-50/50 font-black text-amber-900 border-x border-amber-100">
                      Free tier + ₹49/paper micro-pricing
                    </td>
                    <td className="p-4 sm:p-5">₹20,000–₹60,000 / year</td>
                    <td className="p-4 sm:p-5">Expensive bundled lock-ins</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <PublicFooter />

      {/* Auth Slide-over */}
      <div
        className={`fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-sm transition-opacity duration-500 ${authModal.isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${authModal.isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
      >
        {authModal.isOpen && (
          <LoginPage
            initialMode={authModal.mode}
            initialPersona={authModal.defaultRole}
            onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
            onAuthenticated={() => {
              setAuthModal(prev => ({ ...prev, isOpen: false }));
              navigate('/dashboard');
            }}
          />
        )}
      </div>
    </div>
  );
};
