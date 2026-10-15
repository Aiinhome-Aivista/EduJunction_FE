import React, { useState, useEffect, useMemo } from 'react';
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
  FileText,
  Star,
  Check,
  X,
  CreditCard,
  Lock,
  ChevronDown,
  HelpCircle,
  FileDown,
  PhoneCall,
  Smartphone,
  Building2,
  QrCode,
  Loader2,
} from 'lucide-react';
import { PublicHeader } from './common/PublicHeader';
import { PublicFooter } from './common/PublicFooter';
import { LoginPage } from './LoginPage';
import ApiServices, { getStoredTokens } from '../services/ApiServices';
import { Board, ClassGrade } from '../types';

const BOARDS: Board[] = ['CBSE', 'ICSE', 'ISC'];

const BOARD_CLASSES_MAP: Record<string, ClassGrade[]> = {
  CBSE: ['Class 10', 'Class 12'],
  ICSE: ['Class 10'],
  ISC: ['Class 12'],
};

const SUBJECTS_BY_BOARD_CLASS: Record<string, string[]> = {
  CBSE_10: ['Mathematics', 'Science (Physics/Chem/Bio)', 'Social Science', 'English'],
  CBSE_12: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
  ICSE_10: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History & Civics', 'Geography', 'English'],
  ISC_12: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
};

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!getStoredTokens();

  // Selected Board & Class filter
  const [selectedBoard, setSelectedBoard] = useState<Board>('CBSE');
  const [selectedClass, setSelectedClass] = useState<ClassGrade>('Class 10');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Dynamic plans from backend
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(false);

  // Auth modal state for checkout/register
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

  // Sync available classes when board changes
  useEffect(() => {
    const classes = BOARD_CLASSES_MAP[selectedBoard] || ['Class 5'];
    if (!classes.includes(selectedClass)) {
      setSelectedClass(classes[0]);
    }
  }, [selectedBoard]);

  // Sync available subjects
  const currentSubjects = useMemo(() => {
    const key = `${selectedBoard}_${selectedClass.replace('Class ', '')}`;
    return SUBJECTS_BY_BOARD_CLASS[key] || SUBJECTS_BY_BOARD_CLASS['CBSE_10'];
  }, [selectedBoard, selectedClass]);

  useEffect(() => {
    if (!currentSubjects.includes(selectedSubject)) {
      setSelectedSubject(currentSubjects[0] || 'Mathematics');
    }
  }, [currentSubjects]);

  // Fetch active plans from backend if available
  useEffect(() => {
    let isMounted = true;
    const fetchActivePlans = async () => {
      setIsLoadingPlans(true);
      try {
        const res = await ApiServices.getActiveSubscriptionPlans();
        if (isMounted && res?.plans && res.plans.length > 0) {
          setDbPlans(res.plans);
        }
      } catch (err) {
        console.warn('Could not fetch active pricing plans, using default tiers', err);
      } finally {
        if (isMounted) setIsLoadingPlans(false);
      }
    };
    fetchActivePlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTierAction = (tierType: 'free' | 'paid') => {
    if (tierType === 'free') {
      navigate('/quick-test');
      return;
    }

    if (isLoggedIn) {
      navigate('/dashboard');
      return;
    }

    // Prompt signup/login to complete purchase & link student account
    openAuth('register', 'student');
  };

  const activePlan = dbPlans[0] || {
    planName: 'Full Model Question Paper 2027 (Single Exam Pass)',
    priceInr: 300,
    durationMinutes: 180,
    totalMarks: 80,
    description: 'A complete model question paper with board-aligned evaluation.',
    features: [],
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-clip flex flex-col justify-between">
      {/* Header */}
      <PublicHeader onOpenAuth={openAuth} />

      <main className="flex-1">
        {/* ============================================================== */}
        {/* HERO SECTION                                                   */}
        {/* ============================================================== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-50/70 via-white to-stone-50 pt-16 sm:pt-20 pb-12 sm:pb-16 border-b border-amber-200/40">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-yellow-200/40 blur-3xl pointer-events-none" />
          <div className="absolute top-48 -left-32 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-950 text-xs font-black mb-4 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
              <span>Transparent & Accessible Board Prep Pricing</span>
            </div>

            {/* Main Headline with Word Spacing */}
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-normal [word-spacing:0.25em] leading-[1.15] max-w-4xl mx-auto uppercase"
              style={{ wordSpacing: '0.25em' }}
            >
              INVEST IN TOP RANKS,{' '}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                NOT OVERPRICED TUITION
              </span>
            </h1>

            <p className="mt-4 text-stone-700 text-sm sm:text-base lg:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Transparent, student-friendly pricing for CBSE, ICSE & ISC candidates. Start with our 100% free diagnostic tier — zero credit card required.
            </p>

            {/* Interactive Target Board & Class Filter */}
            <div className="mt-8 max-w-2xl mx-auto p-4 sm:p-5 rounded-3xl bg-yellow-300  to-yellow-400 border border-amber-400 hover:shadow-xl shadow-amber-500/20">
              <div className="text-xs font-black text-stone-900 uppercase tracking-wider mb-3 text-center">
                Configure Pricing for Your Academic Target
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Board Selector */}
                <div>
                  <label className="block text-[11px] font-black text-stone-900 mb-1">Target Board</label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value as Board)}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/90 border border-amber-500/60 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/30"
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>{b} Board</option>
                    ))}
                  </select>
                </div>

                {/* Class Selector */}
                <div>
                  <label className="block text-[11px] font-black text-stone-900 mb-1">Class / Grade</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value as ClassGrade)}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/90 border border-amber-500/60 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/30"
                  >
                    {(BOARD_CLASSES_MAP[selectedBoard] || ['Class 10']).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Selector */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-black text-stone-900 mb-1">Primary Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/90 border border-amber-500/60 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/30"
                  >
                    {currentSubjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 4-TIER PRICING MATRIX                                          */}
        {/* ============================================================== */}
        <section className="py-16 sm:py-20 bg-stone-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
              {/* TIER 1: FREE STARTER TIER */}
              <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-stone-300 transition-all flex flex-col justify-between">
                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-stone-100 text-stone-700">
                    Free Starter
                  </span>
                  <h3 className="mt-4 text-xl font-black text-stone-900">Zero-Risk Diagnostic</h3>
                  <p className="mt-1.5 text-xs text-stone-500 leading-relaxed font-normal">
                    Experience verified curriculum questions and instant 0.05s evaluation.
                  </p>

                  <div className="mt-5 pb-5 border-b border-stone-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-stone-950">₹0</span>
                      <span className="text-xs text-stone-500 font-bold">/ forever</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold mt-1">No credit card or login needed</div>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs text-stone-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>2 Free Practice Tests</strong> (Full 5-Min Diagnostics)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Instant 0.05s AI score &amp; weak-spot radar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Free Student &amp; Parent dashboard access</span>
                    </li>
                    <li className="flex items-start gap-2 text-stone-400">
                      <X className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                      <span>Full 3-Hour Board Specimen Mocks</span>
                    </li>
                    <li className="flex items-start gap-2 text-stone-400">
                      <X className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                      <span>Printable Offline PDF Answer Papers</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleTierAction('free')}
                    className="w-full py-3 px-4 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-300 text-stone-900 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Start Free Practice Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ACTIVE MODEL PAPER PLAN */}
              <div className="rounded-3xl bg-gradient-to-b from-amber-500/10 via-white to-amber-100/20 border-2 border-amber-400 p-6 sm:p-7 hover:shadow-xl shadow-amber-400/15 relative flex flex-col justify-between">
                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                    Model Paper Plan
                  </span>
                  <h3 className="mt-4 text-xl font-black text-stone-900">{activePlan.planName}</h3>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed font-normal">
                    {activePlan.description || `A ${activePlan.durationMinutes || 180}-minute model paper with ${activePlan.totalMarks || 80} marks, aligned to your selected board and class.`}
                  </p>

                  <div className="mt-5 pb-5 border-b border-amber-200/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-stone-950">₹{activePlan.priceInr ?? 300}</span>
                      <span className="text-xs text-stone-500 font-bold">/ paper</span>
                    </div>
                    {/* <div className="text-[11px] text-amber-900 font-bold mt-1">{selectedBoard} {selectedClass} • {activePlan.durationMinutes || 180} minutes • {activePlan.totalMarks || 80} marks</div> */}
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs text-stone-800 font-medium">
                    {(activePlan.features?.length ? activePlan.features : [
                      'Board-aligned model question paper',
                      'Step-by-step evaluation',
                      'Review your results and learning gaps',
                    ]).map((feature: string) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-amber-200/80">
                  <button
                    type="button"
                    onClick={() => handleTierAction('paid')}
                    disabled={isLoadingPlans}
                    className="w-full py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-amber-500/20 active:scale-98 disabled:opacity-60 disabled:cursor-wait"
                  >
                    <span>{isLoadingPlans ? 'Loading plan…' : `Get Model Paper (₹${activePlan.priceInr ?? 300})`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* TRUST GUARANTEES & PAYMENT ASSURANCE                           */}
        {/* ============================================================== */}
        <section className="py-14 bg-white border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-5 h-5 text-amber-700" />
                </div>
                <h4 className="text-sm font-black text-stone-900">Razorpay Security</h4>
                <p className="mt-1 text-xs text-stone-500">Bank-grade encrypted payments via UPI, Google Pay, PhonePe, Cards &amp; NetBanking.</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-5 h-5 text-emerald-700" />
                </div>
                <h4 className="text-sm font-black text-stone-900">Instant Access Unlock</h4>
                <p className="mt-1 text-xs text-stone-500">Your model test papers and analytics are unlocked immediately upon payment confirmation.</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-5 h-5 text-sky-700" />
                </div>
                <h4 className="text-sm font-black text-stone-900">100% Curriculum Accuracy</h4>
                <p className="mt-1 text-xs text-stone-500">Strictly conforms to official 2025–26 blueprints with zero outdated syllabus questions.</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-3">
                  <FileDown className="w-5 h-5 text-purple-700" />
                </div>
                <h4 className="text-sm font-black text-stone-900">Offline Printable PDFs</h4>
                <p className="mt-1 text-xs text-stone-500">Download formatted PDF question papers and official marking schemes for desk practice.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* FREQUENTLY ASKED QUESTIONS ACCORDION                           */}
        {/* ============================================================== */}
        <section className="py-20 bg-stone-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-3">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Got Questions?</span>
              </div>
              <h2
                className="text-2xl sm:text-4xl font-black text-stone-900 tracking-normal [word-spacing:0.2em] uppercase"
                style={{ wordSpacing: '0.2em' }}
              >
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 font-medium">
                Everything you need to know about EduJunction subscriptions and mock tests.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'Can I try EduJunction for free before paying anything?',
                  a: 'Yes, absolutely! You can start immediately with our Free Starter tier which includes 2 full 5-minute quick diagnostic tests with instant AI grading. No credit card, payment details, or lengthy forms are required.',
                },
                {
                  q: 'Are the questions aligned with the latest 2025–2026 board exam pattern?',
                  a: 'Yes, 100%. All questions are strictly mapped to the latest CBSE, ICSE, and ISC council blueprints. This includes Section A (MCQs & Assertion-Reasoning), Section B (Short Answers), Section C, Section D (Long Answers), and Section E (Competency-based Case Studies).',
                },
                {
                  q: 'Can I download the question papers to practice offline on paper?',
                  a: 'Yes! All purchased model papers and subject packs come with one-click downloadable offline PDF question papers and complete step-by-step answer keys, formatted perfectly for standard A4 printing.',
                },
                {
                  q: 'How does the instant AI step evaluation work for subjective questions?',
                  a: 'Unlike generic test sites that only check multiple-choice answers, EduJunction uses step-marking rubrics formulated from official board evaluator guidelines. It breaks down numerical formulas, derivations, and explanations to award appropriate partial credit and highlight mistakes.',
                },
                {
                  q: 'Can parents monitor test scores and schedules?',
                  a: 'Yes! When you register a parent account or link a child sub-account, parents receive real-time test completion summaries, can schedule weekend mock exams, and download comprehensive shareable dossiers.',
                },
                {
                  q: 'What payment methods are supported?',
                  a: 'We use Razorpay 256-bit encrypted checkout supporting all popular Indian payment options: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), and NetBanking across 50+ banks.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left font-black text-stone-900 text-sm sm:text-base flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${
                        openFaqIndex === idx ? 'rotate-180 text-amber-600' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
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
