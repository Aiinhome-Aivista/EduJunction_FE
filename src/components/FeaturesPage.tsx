import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  BrainCircuit,
  MessageSquare,
  FileDown,
} from 'lucide-react';
import { PublicHeader } from './common/PublicHeader';
import { PublicFooter } from './common/PublicFooter';
import { LoginPage } from './LoginPage';

export const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  // Auth modal state for quick login/signup anywhere on the page
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
    defaultRole?: 'parent' | 'student' | 'teacher';
  }>({
    isOpen: false,
    mode: 'login',
    defaultRole: 'student',
  });

  const openAuth = (mode: 'login' | 'register' = 'register', role: 'parent' | 'student' | 'teacher' = 'student') => {
    setAuthModal({ isOpen: true, mode, defaultRole: role });
  };

  // Interactive Persona Switcher: 'student' | 'parent' | 'teacher'
  const [activePersona, setActivePersona] = useState<'student' | 'parent' | 'teacher'>('student');

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-clip flex flex-col justify-between">
      {/* Header */}
      <PublicHeader onOpenAuth={openAuth} />

      <main className="flex-1">
        {/* ============================================================== */}
        {/* HERO SECTION                                                   */}
        {/* ============================================================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-50/80 via-white to-stone-50 pt-16 sm:pt-20 pb-16 sm:pb-24 border-b border-amber-200/40">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-yellow-200/40 blur-3xl pointer-events-none" />
          <div className="absolute top-48 -left-32 w-80 h-80 rounded-full bg-amber-200/35 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-950 text-xs font-black mb-5 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
              <span>EduJunction Capabilities & Architecture</span>
            </div>

            {/* Main Headline with Word Spacing */}
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-normal [word-spacing:0.25em] leading-[1.15] max-w-4xl mx-auto uppercase"
              style={{ wordSpacing: '0.25em' }}
            >
              EVERY TOOL YOU NEED TO{' '}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                MASTER YOUR SYLLABUS
              </span>
            </h1>

            <p className="mt-4 text-stone-700 text-sm sm:text-base lg:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              From instant 0.05s AI step grading and 2027 curriculum-verified model papers to adaptive learning paths and parent dossiers — explore the architecture engineered for academic excellence.
            </p>

            {/* Persona Switcher Tabs */}
            <div className="mt-10 inline-flex p-1.5 rounded-2xl bg-stone-200/70 border border-stone-300/80 backdrop-blur-md max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setActivePersona('student')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                  activePersona === 'student'
                    ? 'bg-stone-950 text-amber-400 shadow-md'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Arena</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona('parent')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                  activePersona === 'parent'
                    ? 'bg-stone-950 text-amber-400 shadow-md'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Parent Visibility</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePersona('teacher')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                  activePersona === 'teacher'
                    ? 'bg-stone-950 text-amber-400 shadow-md'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/60'
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Teacher & Tutor Synergy</span>
              </button>
            </div>

            {/* Persona Dynamic Showcase Banner */}
            <div className="mt-8 max-w-4xl mx-auto rounded-3xl bg-white border border-amber-200/90 p-6 sm:p-8 shadow-xl shadow-amber-500/5 text-left transition-all">
              {activePersona === 'student' && (
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      For Independent Learners
                    </span>
                    <h3 className="mt-3 text-xl sm:text-2xl font-black text-stone-900">
                      Learn Smarter with Zero-Stress Feedback
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Practice questions tailored strictly to CBSE, ICSE & ISC exam patterns. Receive instantaneous step marks, concept explanations, and earn XP to climb the school leaderboard.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">⚡ 0.05s Instant Evaluation</span>
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">🔥 Streak Multipliers</span>
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">🎮 Magic Word Arena</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                      <span>CBSE Class 10 • Quadratic Equations</span>
                      <span className="text-emerald-600 font-black">94% Accuracy</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                    <p className="text-[11px] text-stone-500 italic">
                      "Step 2: Correct discriminant calculation (b² - 4ac = 16). Full 3/3 marks awarded with verified rubric."
                    </p>
                  </div>
                </div>
              )}

              {activePersona === 'parent' && (
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300">
                      For Connected Parents
                    </span>
                    <h3 className="mt-3 text-xl sm:text-2xl font-black text-stone-900">
                      Real-Time Insight Without Constant Micromanagement
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Stay informed of your child's syllabus completion, strengths, and trouble spots. Schedule weekend mock tests and download one-click WhatsApp/Email performance dossiers.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">📱 WhatsApp Score Alerts</span>
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">🗓️ Exam Scheduler</span>
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">📊 Shareable Dossier</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-950">
                      <ShieldCheck className="w-4 h-4 text-sky-600" />
                      <span>Parent Performance Dossier • Generated Today</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-sky-200/80 text-xs space-y-1">
                      <div className="font-black text-stone-900">Rohan Kumar (Class 10 - CBSE)</div>
                      <div className="text-stone-600">Total Practice Tests: 18 • Syllabus Coverage: 82%</div>
                      <div className="text-amber-700 font-bold">Suggested Focus: Light Reflection Ray Diagrams</div>
                    </div>
                  </div>
                </div>
              )}

              {activePersona === 'teacher' && (
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
                      For Educators & Coaching Institutes
                    </span>
                    <h3 className="mt-3 text-xl sm:text-2xl font-black text-stone-900">
                      Automate Grading & Amplify Personalized Mentorship
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Save up to 12 hours weekly on repetitive marking. Access official board blueprints, assign targeted topic drills, and conduct transparent Parent-Teacher meetings.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">📋 Automated Rubrics</span>
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">💬 Direct Parent Chat</span>
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">📄 Printable Paper Vault</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                      <span>Batch 10A • Pre-Board Readiness</span>
                      <span className="text-purple-700 font-black">28 Students</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-purple-200/80 text-xs space-y-1">
                      <div className="font-black text-stone-900">Marking Time Saved: 85%</div>
                      <div className="text-stone-600">Standardized CBSE marking guidelines applied to all papers.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/quick-test')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-stone-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-stone-950" />
                <span>Try Instant 5-Min Quick Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 text-stone-800 font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View All Subscription & Pricing Plans</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* CORE CAPABILITY PILLARS (5 DEEP-DIVE CARDS)                    */}
        {/* ============================================================== */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-3">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>Core Architectural Modules</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-black text-stone-900 tracking-normal [word-spacing:0.2em] uppercase"
                style={{ wordSpacing: '0.2em' }}
              >
                THE 5 PILLARS OF EDUJUNCTION
              </h2>
              <p className="mt-3 text-stone-600 text-sm sm:text-base font-medium">
                Engineered from the ground up to replace guesswork with data-driven academic mastery.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Pillar 1 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-stone-50/80 border border-amber-200/80 hover:border-amber-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-md shadow-amber-400/30 mb-5">
                    <Zap className="w-6 h-6 fill-stone-950" />
                  </div>
                  <h3 className="text-xl font-black text-stone-900">1. Instant 0.05s AI Diagnostic & Step Marking</h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Powered by verified question database architecture. Answers are evaluated line-by-line using official CBSE/ICSE marking rubrics.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs font-medium text-stone-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Instant 0.05s question loading with zero API lag</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Subjective step marking with partial credit detection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Pinpoints exact formula error or misconception</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-200/80">
                  <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider">Speed: 0.05s Load Time</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-stone-50/80 border border-sky-200/80 hover:border-sky-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black shadow-md shadow-sky-500/30 mb-5">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-stone-900">2. Official 2027 Model Exam Papers</h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Exact replica board examination blueprints. Section A to E breakdown including Case Studies, Assertion-Reasoning, and practicals.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs font-medium text-stone-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Full 3-Hour (180 mins) Board Exam Simulation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Downloadable Offline PDF question & answer papers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Official blueprint conformity for CBSE, ICSE & ISC</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-200/80">
                  <span className="text-[11px] font-black uppercase text-sky-700 tracking-wider">Format: Digital & PDF Print</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-stone-50/80 border border-emerald-200/80 hover:border-emerald-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/30 mb-5">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-stone-900">3. Adaptive Learning & 24/7 Study Buddy</h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    No two students have the same struggle. When a student falters in Trigonometry, the platform dynamically generates bridging concepts.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs font-medium text-stone-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Dynamic concept path re-routing based on diagnostics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>AI Study Buddy available for doubt clarification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Targeted remedial revision modules</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-200/80">
                  <span className="text-[11px] font-black uppercase text-emerald-700 tracking-wider">Personalized: 1-on-1 Calibration</span>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-stone-50/80 border border-purple-200/80 hover:border-purple-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center font-black shadow-md shadow-purple-500/30 mb-5">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-stone-900">4. The Tri-Bridge Ecosystem</h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Unites student, parent, and teacher into a single synchronized feedback loop without awkward WhatsApp groups or phone tags.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs font-medium text-stone-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Live WhatsApp / Email test completion alerts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Parent Exam Scheduler with custom time caps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Direct PTM communication and progress dossier</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-200/80">
                  <span className="text-[11px] font-black uppercase text-purple-700 tracking-wider">Sync: Student • Parent • Teacher</span>
                </div>
              </div>

              {/* Pillar 5 */}
              <div className="p-6 sm:p-8 rounded-3xl bg-stone-50/80 border border-rose-200/80 hover:border-rose-400 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-md shadow-rose-500/30 mb-5">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-stone-900">5. FunZone & Concept Gamification</h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Turn monotonous studying into healthy competition. Magic Word Arena, concept crossword challenges, and XP leaderboards keep students motivated.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs font-medium text-stone-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Magic Word Arena: Build scientific & literary vocabulary</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Streak Flame: Consistency rewards that build daily habits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Badge Hall of Fame: Unlock bronze, silver & gold honors</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-200/80">
                  <span className="text-[11px] font-black uppercase text-rose-700 tracking-wider">Engagement: 3.4x Higher Retention</span>
                </div>
              </div>

              {/* Pillar 6: Verification Guarantee */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-stone-950 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-stone-950 text-amber-400 flex items-center justify-center font-black shadow-md mb-5">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black">100% Curriculum Accuracy Guarantee</h3>
                  <p className="mt-2.5 text-xs sm:text-sm font-semibold text-stone-900 leading-relaxed">
                    Every question, marking guideline, and derivation in our repository is cross-checked against official NCERT, Selina, and Council specimen papers.
                  </p>
                  <div className="mt-5 p-3 rounded-2xl bg-stone-950/15 border border-stone-950/20 text-xs font-bold space-y-1.5">
                    <div>✓ Zero hallucination risk</div>
                    <div>✓ Updated to latest 2025–26 official blueprints</div>
                    <div>✓ Verified by experienced board evaluators</div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-950/20">
                  <button
                    type="button"
                    onClick={() => openAuth('register')}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-950 hover:bg-stone-900 text-yellow-400 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Start Free Student Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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

        {/* ============================================================== */}
        {/* BOTTOM HIGH-CONVERTING CTA BANNER                              */}
        {/* ============================================================== */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>Zero Risk • Instant Start</span>
            </div>
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-normal [word-spacing:0.25em] leading-tight uppercase"
              style={{ wordSpacing: '0.25em' }}
            >
              READY TO ACCELERATE YOUR BOARD PREPARATION?
            </h2>
            <p className="mt-3.5 text-stone-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              Take an instant 5-minute diagnostic test or unlock comprehensive board model papers with verified solutions.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => navigate('/quick-test')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-stone-950 font-black text-sm sm:text-base shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Take a Free Quick Test</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore Pricing & Mock Packs</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />

      {/* Auth Modal */}
      {authModal.isOpen && (
        <LoginPage
          isOpen={authModal.isOpen}
          initialMode={authModal.mode}
          initialRole={authModal.defaultRole}
          onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
          onAuthenticated={() => {
            setAuthModal(prev => ({ ...prev, isOpen: false }));
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
};
