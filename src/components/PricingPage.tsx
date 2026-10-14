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
    defaultRole?: 'parent' | 'student' | 'teacher';
  }>({
    isOpen: false,
    mode: 'login',
    defaultRole: 'student',
  });

  const openAuth = (mode: 'login' | 'register' = 'register', role: 'parent' | 'student' | 'teacher' = 'student') => {
    setAuthModal({ isOpen: true, mode, defaultRole: role });
  };

  // Sync available classes when board changes
  useEffect(() => {
    const classes = BOARD_CLASSES_MAP[selectedBoard] || ['Class 10'];
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

  const handleTierAction = (tierType: 'free' | 'single' | 'subject' | 'all') => {
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
            <div className="mt-8 max-w-2xl mx-auto p-4 sm:p-5 rounded-3xl bg-white border border-amber-200/90 shadow-lg shadow-amber-500/5">
              <div className="text-xs font-black text-stone-500 uppercase tracking-wider mb-3 text-center">
                Configure Pricing for Your Academic Target
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Board Selector */}
                <div>
                  <label className="block text-[11px] font-black text-stone-600 mb-1">Target Board</label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value as Board)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>{b} Board</option>
                    ))}
                  </select>
                </div>

                {/* Class Selector */}
                <div>
                  <label className="block text-[11px] font-black text-stone-600 mb-1">Class / Grade</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value as ClassGrade)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {(BOARD_CLASSES_MAP[selectedBoard] || ['Class 10']).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Selector */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-black text-stone-600 mb-1">Primary Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
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
                    className="w-full py-3 px-4 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-900 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Start Free Practice Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* TIER 2: SINGLE MODEL SPECIMEN PAPER */}
              <div className="rounded-3xl bg-white border border-amber-200/90 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between">
                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/80">
                    Single Assessment
                  </span>
                  <h3 className="mt-4 text-xl font-black text-stone-900">Specimen Model Paper</h3>
                  <p className="mt-1.5 text-xs text-stone-500 leading-relaxed font-normal">
                    One complete 3-hour official board specimen paper for exam rehearsal.
                  </p>

                  <div className="mt-5 pb-5 border-b border-stone-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-stone-950">₹49</span>
                      <span className="text-xs text-stone-500 font-bold">/ paper</span>
                    </div>
                    <div className="text-[11px] text-amber-700 font-bold mt-1">One-time payment • Lifetime review</div>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs text-stone-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>1 Full 3-Hour Model Paper</strong> ({selectedBoard} {selectedClass})</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Exact Section A to E Board Blueprint breakdown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Downloadable Offline PDF with step solutions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Line-by-line subjective step grading</span>
                    </li>
                    <li className="flex items-start gap-2 text-stone-400">
                      <X className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                      <span>Formula Vault &amp; Multi-Test Analytics</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleTierAction('single')}
                    className="w-full py-3 px-4 rounded-xl bg-stone-950 hover:bg-stone-900 text-yellow-400 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Get 1 Specimen Paper (₹49)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* TIER 3: SUBJECT MASTERY PACK (POPULAR) */}
              <div className="rounded-3xl bg-gradient-to-b from-amber-500/10 via-white to-amber-100/20 border-2 border-amber-400 p-6 sm:p-7 shadow-xl shadow-amber-400/15 relative flex flex-col justify-between">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-stone-950" />
                  <span>Most Popular Choice</span>
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-200/90 text-amber-950 border border-amber-300">
                    Complete Subject
                  </span>
                  <h3 className="mt-4 text-xl font-black text-stone-900">Subject Mastery Pack</h3>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed font-normal">
                    Complete mastery in <strong>{selectedSubject}</strong> with full mocks and formula vaults.
                  </p>

                  <div className="mt-5 pb-5 border-b border-amber-200/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-stone-950">₹399</span>
                      <span className="text-xs text-stone-500 line-through">₹799</span>
                      <span className="text-xs text-amber-900 font-black">50% OFF</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-bold mt-1">Unlimited attempts until 2027 boards</div>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs text-stone-800 font-medium">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span><strong>10+ Full-Length Model Mocks</strong> for {selectedSubject}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>Chapter-wise practice drills (Unlimited attempts)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>Past 10 Years Solved Board Papers (PYQs)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>Full Derivation &amp; Formula Vault included</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>Offline PDF question &amp; solution downloads</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-amber-200/80">
                  <button
                    type="button"
                    onClick={() => handleTierAction('subject')}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-stone-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-98"
                  >
                    <span>Get Subject Pack (₹399)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* TIER 4: ALL-SUBJECTS ACADEMIC PASS */}
              <div className="rounded-3xl bg-stone-900 text-white p-6 sm:p-7 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between border border-stone-800">
                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-stone-800 text-amber-400 border border-stone-700">
                    All-Access Pass
                  </span>
                  <h3 className="mt-4 text-xl font-black text-white">Full Board Exam Suite</h3>
                  <p className="mt-1.5 text-xs text-stone-400 leading-relaxed font-normal">
                    Unlock every subject in {selectedBoard} {selectedClass} for the entire academic year.
                  </p>

                  <div className="mt-5 pb-5 border-b border-stone-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-white">₹999</span>
                      <span className="text-xs text-stone-500 line-through">₹2,499</span>
                      <span className="text-xs text-amber-400 font-bold">60% OFF</span>
                    </div>
                    <div className="text-[11px] text-amber-400 font-bold mt-1">Covers all subjects • Valid till Board Exams</div>
                  </div>

                  <ul className="mt-5 space-y-2.5 text-xs text-stone-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>All Subjects Included</strong> (Maths, Science, Social, English)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>50+ Full-length Board Mock Examinations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Priority Step-by-Step AI Evaluation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Weekly WhatsApp / Email Parent Dossier</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Exam Scheduler &amp; AI Study Buddy access</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => handleTierAction('all')}
                    className="w-full py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                  >
                    <span>Unlock All-Subjects Suite (₹999)</span>
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
                <h4 className="text-sm font-black text-stone-900">256-Bit Razorpay Security</h4>
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

        {/* ============================================================== */}
        {/* BOTTOM ACTION CTA                                              */}
        {/* ============================================================== */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-stone-950 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2
              className="text-2xl sm:text-4xl font-black tracking-normal [word-spacing:0.25em] leading-tight uppercase"
              style={{ wordSpacing: '0.25em' }}
            >
              START PREPARING WITH 100% CONFIDENCE TODAY
            </h2>
            <p className="mt-3.5 text-stone-950/80 font-bold text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              Take your first quick diagnostic assessment for free or unlock complete subject board packs in just 30 seconds.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => navigate('/quick-test')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-stone-950 hover:bg-stone-900 text-yellow-400 font-black text-sm sm:text-base shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Take a Free Quick Test</span>
                <ArrowRight className="w-5 h-5 text-yellow-400" />
              </button>

              <button
                type="button"
                onClick={() => openAuth('register', 'student')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-950 font-black text-sm sm:text-base border border-stone-200 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Create Student Account</span>
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
