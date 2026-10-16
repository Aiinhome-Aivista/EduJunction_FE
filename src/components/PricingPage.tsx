import React, { useState, useEffect } from 'react';
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

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!getStoredTokens();

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
        {/* ============================================================== */}
        {/* HERO & PRICING PLANS SECTION (FITS 100VH)                      */}
        {/* ============================================================== */}
        <section className="min-h-[calc(100vh-72px)] lg:h-[calc(100vh-72px)] flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-amber-50/70 via-white to-stone-50 py-3 sm:py-5 border-b border-amber-200/40">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-yellow-200/40 blur-3xl pointer-events-none" />
          <div className="absolute top-48 -left-32 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-950 text-[11px] font-black mb-4 sm:mb-5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" />
              <span>Transparent &amp; Accessible Board Prep Pricing</span>
            </div>

            {/* Main Headline with Word Spacing */}
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-normal [word-spacing:0.2em] leading-[1.12] max-w-4xl mx-auto uppercase"
              style={{ wordSpacing: '0.2em' }}
            >
              INVEST IN TOP RANKS,{' '}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                NOT OVERPRICED TUITION
              </span>
            </h1>

            <p className="mt-3.5 sm:mt-4 text-stone-700 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed">
              Transparent, student-friendly pricing for CBSE, ICSE &amp; ISC candidates. Start free with instant result — zero credit card required.
            </p>

            {/* Side-by-side Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-4 lg:gap-6 items-stretch max-w-3xl lg:max-w-4xl mx-auto mt-5 sm:mt-6 text-left">
              {/* TIER 1: FREE STARTER TIER */}
              <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-stone-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-700">
                      Free Starter
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">No card or login needed</span>
                  </div>
                  <h3 className="mt-2 text-base sm:text-lg font-black text-stone-900">Zero-Risk</h3>
                  <p className="mt-0.5 text-[11px] text-stone-500 leading-snug font-normal">
                    Experience verified curriculum questions and instant 0.05s evaluation.
                  </p>

                  <div className="mt-2 pb-2 border-b border-stone-100 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-stone-950">₹0</span>
                    <span className="text-xs text-stone-500 font-bold">/ forever</span>
                  </div>

                  <ul className="mt-2 space-y-1.5 text-[11px] sm:text-xs text-stone-700">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>2 Free Practice Tests</strong> (Full 5-Min Assessment)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Instant score &amp; weak-spot radar</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Free PDF download of the Assessment Report</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-3.5 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleTierAction('free')}
                    className="w-full py-2 px-3.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-200 text-stone-900 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Start Free Practice Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ACTIVE MODEL PAPER PLAN */}
              <div className="rounded-2xl bg-gradient-to-b from-amber-500/10 via-white to-amber-100/20 border-2 border-amber-400 p-4 sm:p-5 hover:shadow-xl shadow-amber-400/15 relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      Model Paper Plan
                    </span>
                  </div>
                  <h3 className="mt-2 text-base sm:text-lg font-black text-stone-900">{activePlan.planName}</h3>
                  <p className="mt-0.5 text-[11px] text-stone-600 leading-snug font-normal">
                    {activePlan.description || `A ${activePlan.durationMinutes || 180}-minute model paper with ${activePlan.totalMarks || 80} marks, aligned to your curriculum.`}
                  </p>

                  <div className="mt-2 pb-2 border-b border-amber-200/80 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-stone-950">₹{activePlan.priceInr ?? 300}</span>
                    <span className="text-xs text-stone-500 font-bold">/ paper</span>
                  </div>

                  <ul className="mt-2 space-y-1.5 text-[11px] sm:text-xs text-stone-800 font-medium">
                    {(activePlan.features?.length ? activePlan.features : [
                      'Board-aligned 3-hour model question paper',
                      'Step-by-step AI grading & rubric marks',
                      'Printable offline PDF answer paper',
                    ]).map((feature: string) => (
                      <li key={feature} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3.5 pt-2 border-t border-amber-200/80">
                  <button
                    type="button"
                    onClick={() => handleTierAction('paid')}
                    disabled={isLoadingPlans}
                    className="w-full py-2 px-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-amber-500/20 active:scale-98 disabled:opacity-60 disabled:cursor-wait"
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
        <section className="min-h-screen flex flex-col justify-center py-16 bg-stone-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-10">
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
