import React from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader } from './common/PublicHeader';
import { PublicFooter } from './common/PublicFooter';
import {
  ArrowLeft,
  ShieldAlert,
  BookOpen,
  Cpu,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  Globe,
  Clock,
  CheckCircle2,
  Mail,
  Lock,
  Database,
  Share2,
  UserCheck,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  FileText,
  CreditCard,
  Scale,
  UserPlus,
  Compass,
  Key,
  Flame,
  Award
} from 'lucide-react';
import { SEO } from './common/SEO';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'disclaimer';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [type]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 relative overflow-hidden">
      <SEO
        title={
          type === 'disclaimer'
            ? 'Disclaimer – EduJunction'
            : type === 'privacy'
              ? 'Privacy Policy – EduJunction'
              : 'Terms of Service – EduJunction'
        }
        description={
          type === 'privacy'
            ? 'At EduJunction, your privacy is important to us. Read our Privacy Policy explaining how we collect, use, and protect your information.'
            : type === 'disclaimer'
              ? 'EduJunction provides diagnostic educational assessments and learning tools. Read our platform disclaimer regarding automated evaluations and learning aids.'
              : 'EduJunction Terms of Service. Read the conditions, academic integrity rules, and legal terms governing the use of our platform.'
        }
        canonicalUrl={`https://www.edujunction.co.in/${type}`}
      />

      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-yellow-300/20 via-amber-200/15 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-orange-200/15 via-yellow-100/20 to-transparent rounded-full blur-3xl -z-10" />

      {/* Header */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-amber-600 transition-colors uppercase tracking-wider group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* ── PRIVACY POLICY SPECIALIZED RICH LAYOUT ── */}
        {type === 'privacy' ? (
          <div className="space-y-10">
            {/* Header Title & Intro */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 leading-tight">
                Privacy Policy - <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">EduJunction</span>
              </h1>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
                At <strong className="text-stone-900 font-semibold">EduJunction</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;), accessible at{' '}
                <a href="https://edujunction.co.in" className="text-amber-600 hover:underline font-semibold">
                  edujunction.co.in
                </a>
                , your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our platform to access personalized learning experiences. By using our Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>

            {/* Privacy Clauses Grid */}
            <div className="space-y-6">
              {/* 1. Information We Collect */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Database className="w-5 h-5 text-amber-600" />
                      Information We Collect
                    </h2>
                    <ul className="space-y-2.5">
                      <li className="text-stone-600 text-sm sm:text-base leading-relaxed">
                        <strong className="text-stone-900 font-semibold">• Personal Information:</strong> Name, email address, phone number, date of birth, and educational details provided during registration.
                      </li>
                      <li className="text-stone-600 text-sm sm:text-base leading-relaxed">
                        <strong className="text-stone-900 font-semibold">• Usage Data:</strong> Pages visited, courses accessed, time spent on the platform, quiz/assessment results, and device/browser information.
                      </li>
                      <li className="text-stone-600 text-sm sm:text-base leading-relaxed">
                        <strong className="text-stone-900 font-semibold">• Payment Information:</strong> If applicable, billing details processed securely through third-party payment gateways (we do not store full card details).
                      </li>
                      <li className="text-stone-600 text-sm sm:text-base leading-relaxed">
                        <strong className="text-stone-900 font-semibold">• Cookies &amp; Tracking:</strong> We use cookies to improve site functionality, remember preferences, and analyze usage patterns.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 2. How We Use Your Information */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-orange-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      How We Use Your Information
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base">We use collected data to:</p>
                    <ul className="space-y-2 pl-2">
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Provide and personalize learning content and recommendations</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Track academic progress and generate performance reports</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Communicate updates, notifications, and support responses</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Improve platform features, security, and user experience</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Comply with legal and regulatory obligations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3. Data Sharing & Disclosure */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-yellow-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-black flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-yellow-600" />
                      Data Sharing &amp; Disclosure
                    </h2>
                    <p className="text-stone-700 text-sm sm:text-base font-medium">
                      We do not sell your personal data to third parties. We may share information only with:
                    </p>
                    <ul className="space-y-2 pl-2">
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                        <span>Service providers (hosting, analytics, payment processors) under confidentiality agreements</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                        <span>Educators/institutions you&apos;re enrolled with, where relevant to your learning activity</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                        <span>Legal authorities, if required by law or to protect our rights and users&apos; safety</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 4. Data Security */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      Data Security
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      We implement industry-standard technical and organizational safeguards (encryption, access controls, secure servers) to protect your data from unauthorized access, alteration, or loss. However, no method of transmission over the internet is 100% secure.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Children's Privacy */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black flex-shrink-0">
                    5
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Children&apos;s Privacy
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      If our platform is used by minors, we require parental/guardian consent for account creation and limit data collection to what is necessary for educational purposes.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Your Rights */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-purple-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black flex-shrink-0">
                    6
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-purple-600" />
                      Your Rights
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base">You may:</p>
                    <ul className="space-y-2 pl-2">
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                        <span>Access, update, or correct your personal information</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                        <span>Request deletion of your account and associated data</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                        <span>Opt out of promotional communications at any time</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                        <span>Withdraw consent for data processing, subject to legal/contractual limits</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 7. Data Retention */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-teal-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black flex-shrink-0">
                    7
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-600" />
                      Data Retention
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      We retain your data only as long as necessary to provide our services or as required by applicable law, after which it is securely deleted or anonymized.
                    </p>
                  </div>
                </div>
              </div>

              {/* 8. Third-Party Links */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-indigo-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black flex-shrink-0">
                    8
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-indigo-600" />
                      Third-Party Links
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      Our platform may contain links to external websites. We are not responsible for the privacy practices or content of these third-party sites.
                    </p>
                  </div>
                </div>
              </div>

              {/* 9. Changes to This Policy */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black flex-shrink-0">
                    9
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-amber-600" />
                      Changes to This Policy
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      We may update this Privacy Policy periodically. Continued use of the Service after changes constitutes acceptance of the revised policy. We recommend reviewing this page periodically.
                    </p>
                  </div>
                </div>
              </div>

              {/* 10. Contact Us Card */}
              <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-orange-500/10 border border-amber-300/80 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black flex-shrink-0 shadow-md shadow-amber-500/20">
                    10
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                      <Mail className="w-6 h-6 text-amber-600" />
                      Contact Us
                    </h2>
                    <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                      If you have any questions or concerns about this Privacy Policy or our data practices, please contact our support team at:
                    </p>
                    <div className="pt-2 flex flex-wrap gap-4 items-center text-sm font-semibold">
                      <a
                        href="https://mail.google.com/mail/u/0/?fs=1&to=support@edujunction.co.in&tf=cm"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                        <span>support@edujunction.co.in</span>
                      </a>
                      <a
                        href="https://edujunction.co.in"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-amber-600 hover:border-amber-300 transition-colors"
                      >
                        <Globe className="w-4 h-4 text-amber-500" />
                        <span>edujunction.co.in</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Meta Footer */}
            <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-stone-400">
              <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>EduJunction Privacy Compliance</span>
            </div>
          </div>
        ) : type === 'terms' ? (
          /* ── TERMS OF SERVICE SPECIALIZED RICH LAYOUT ── */
          <div className="space-y-10">
            {/* Header Title & Intro */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 leading-tight">
                Terms of Service - <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">EduJunction</span>
              </h1>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
                Welcome to <strong className="text-stone-900 font-semibold">EduJunction</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;), accessible at{' '}
                <a href="https://edujunction.co.in" className="text-amber-600 hover:underline font-semibold">
                  edujunction.co.in
                </a>
                . By using our platform, you agree to these Terms of Service. Please read this document carefully — your access to and use of our platform is conditioned on your acceptance of and compliance with these terms. These apply to all visitors, users, and others who access or use the Service.
              </p>
            </div>

            {/* Terms Clauses Grid */}
            <div className="space-y-6">
              {/* 1. Acceptance of Terms */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-amber-600" />
                      Acceptance of Terms
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      By registering for, accessing, or using EduJunction, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, please discontinue use of the platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Eligibility */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                      Eligibility
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      The Service is intended for students, educators, and institutions. Users under 18 must have parental or guardian consent to create an account and use the platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Use of the Platform */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-orange-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-orange-600" />
                      Use of the Platform
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base">EduJunction is provided strictly for educational purposes. By using the Service, you agree to:</p>
                    <ul className="space-y-2 pl-2">
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Use the platform only for lawful, academic, and personal learning purposes</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Not misuse any part of the Service, including gamification elements, assessment tools, or leaderboards</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Not attempt to cheat, manipulate scores, or exploit bugs in quizzes, tests, or progress-tracking features</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Not upload or share content that infringes on intellectual property, is abusive, or violates academic integrity</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 4. Account Responsibilities */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-yellow-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-black flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Key className="w-5 h-5 text-yellow-600" />
                      Account Responsibilities
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. Notify us immediately of any unauthorized access or security breach.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Academic Integrity & Community Guidelines */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-red-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black flex-shrink-0">
                    5
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-red-600" />
                      Academic Integrity &amp; Community Guidelines
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base">We reserve the right to suspend or terminate accounts that:</p>
                    <ul className="space-y-2 pl-2">
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                        <span>Violate academic integrity (e.g., plagiarism, cheating on assessments)</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                        <span>Breach our community guidelines (e.g., harassment, spam, abusive behavior)</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                        <span>Attempt to disrupt or exploit the platform&apos;s systems or gamification features</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 6. Intellectual Property */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-purple-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black flex-shrink-0">
                    6
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      Intellectual Property
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      All content on EduJunction — including courses, quizzes, videos, graphics, and branding — is owned by or licensed to us and protected under applicable intellectual property laws. You may not copy, reproduce, or redistribute this content without prior written permission.
                    </p>
                  </div>
                </div>
              </div>

              {/* 7. Payments & Subscriptions */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black flex-shrink-0">
                    7
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      Payments &amp; Subscriptions
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      If any part of the Service requires payment, all fees are disclosed prior to purchase. Subscriptions, where applicable, renew automatically unless cancelled, subject to our refund policy (if any).
                    </p>
                  </div>
                </div>
              </div>

              {/* 8. Limitation of Liability */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-400 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center font-black flex-shrink-0">
                    8
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-stone-600" />
                      Limitation of Liability
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      EduJunction is provided on an &ldquo;as is&rdquo; basis. We do not guarantee uninterrupted access or error-free performance and are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* 9. Termination */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-red-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black flex-shrink-0">
                    9
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-red-600" />
                      Termination
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      We reserve the right to suspend or terminate your access to the Service at our discretion, without prior notice, if you violate these Terms or engage in conduct harmful to other users or the platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* 10. Changes to These Terms */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-teal-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black flex-shrink-0">
                    10
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-600" />
                      Changes to These Terms
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      We may update these Terms periodically. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms. We encourage you to review this page regularly.
                    </p>
                  </div>
                </div>
              </div>

              {/* 11. Governing Law */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-indigo-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black flex-shrink-0">
                    11
                  </div>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-indigo-600" />
                      Governing Law
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
                    </p>
                  </div>
                </div>
              </div>

              {/* 12. Contact Us Card */}
              <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-orange-500/10 border border-amber-300/80 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black flex-shrink-0 shadow-md shadow-amber-500/20">
                    12
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                      <Mail className="w-6 h-6 text-amber-600" />
                      Contact Us
                    </h2>
                    <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                      If you have any questions or concerns regarding this document, do not hesitate to contact our dedicated support team:
                    </p>
                    <div className="pt-2 flex flex-wrap gap-4 items-center text-sm font-semibold">
                      <a
                        href="https://mail.google.com/mail/u/0/?fs=1&to=support@edujunction.co.in&tf=cm"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                        <span>support@edujunction.co.in</span>
                      </a>
                      <a
                        href="https://edujunction.co.in"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-amber-600 hover:border-amber-300 transition-colors"
                      >
                        <Globe className="w-4 h-4 text-amber-500" />
                        <span>edujunction.co.in</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Meta Footer */}
            <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-stone-400">
              <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>EduJunction Legal Terms Compliance</span>
            </div>
          </div>
        ) : (
          /* ── DISCLAIMER SPECIALIZED RICH LAYOUT ── */
          <div className="space-y-10">
            {/* Header Title & Intro */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 leading-tight">
                Disclaimer - <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">EduJunction</span>
              </h1>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
                <strong className="text-stone-900 font-semibold">EduJunction</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) provides diagnostic educational assessments and learning tools at{' '}
                <a href="https://edujunction.co.in" className="text-amber-600 hover:underline font-semibold">
                  edujunction.co.in
                </a>
                . Please read this Disclaimer carefully before using our platform.
              </p>
            </div>

            {/* Disclaimer Clauses Grid */}
            <div className="space-y-6">
              {/* 1. Educational Purpose Only */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-600" />
                      Educational Purpose Only
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      EduJunction is designed to supplement, not replace, formal education and professional teacher guidance. Our content, assessments, and recommendations are intended as learning aids and should not be treated as a substitute for structured academic instruction, certified curricula, or professional educational counseling.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Accuracy of Automated Assessments */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-orange-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-orange-600" />
                      Accuracy of Automated Assessments
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      While we strive for accuracy, our platform relies on automated evaluation engines to generate diagnostic assessments, feedback, and learning suggestions. These systems may, on occasion:
                    </p>
                    <ul className="space-y-2 pl-2">
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Produce inaccurate, incomplete, or generalized suggestions</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Misinterpret responses due to algorithmic limitations</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        <span>Fail to account for individual learning contexts or nuances</span>
                      </li>
                    </ul>
                    <p className="text-stone-700 text-sm font-medium bg-orange-50/70 p-3.5 rounded-xl border border-orange-200/60">
                      Users should treat all automated results as indicative, not definitive, and consult qualified educators for important academic decisions.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. No Guarantee of Academic Outcomes */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-yellow-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-black flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-yellow-600" />
                      No Guarantee of Academic Outcomes
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      EduJunction makes no warranties or guarantees regarding academic performance, grades, test scores, or learning outcomes resulting from the use of our platform. Learning progress depends on multiple factors beyond our control, including individual effort, external instruction, and personal circumstances.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Limitation of Liability */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-red-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-600" />
                      Limitation of Liability
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      EduJunction, its team, and affiliates are not liable for:
                    </p>
                    <ul className="space-y-2 pl-2">
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                        <span>Any academic outcomes, decisions, or actions taken based solely on platform-generated assessments or suggestions</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                        <span>Errors, inaccuracies, or omissions in automated evaluations</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-stone-600 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                        <span>Any direct, indirect, incidental, or consequential damages arising from reliance on the Service</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 5. Professional Guidance Recommended */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black flex-shrink-0">
                    5
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Professional Guidance Recommended
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      For critical academic decisions — such as exam preparation strategies, subject selection, or addressing learning difficulties — we strongly recommend consulting qualified teachers, academic advisors, or educational institutions in addition to using EduJunction.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Third-Party Content */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-purple-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black flex-shrink-0">
                    6
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-600" />
                      Third-Party Content
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      Where applicable, EduJunction may reference or link to third-party educational resources. We do not control and are not responsible for the accuracy or reliability of such external content.
                    </p>
                  </div>
                </div>
              </div>

              {/* 7. Changes to This Disclaimer */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-teal-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black flex-shrink-0">
                    7
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-600" />
                      Changes to This Disclaimer
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      We may update this Disclaimer periodically to reflect changes in our platform or evaluation methods. Continued use of the Service after updates constitutes acceptance of the revised Disclaimer.
                    </p>
                  </div>
                </div>
              </div>

              {/* 8. Acknowledgment */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black flex-shrink-0">
                    8
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Acknowledgment
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                      Please read this document carefully. Your access to and use of our platform is conditioned on your acceptance of and compliance with this Disclaimer. These terms apply to all visitors, users, and others who access or use the Service.
                    </p>
                  </div>
                </div>
              </div>

              {/* 9. Contact Us Card */}
              <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-orange-500/10 border border-amber-300/80 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black flex-shrink-0 shadow-md shadow-amber-500/20">
                    9
                  </div>
                  <div className="space-y-3 flex-1">
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                      <Mail className="w-6 h-6 text-amber-600" />
                      Contact Us
                    </h2>
                    <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                      If you have any questions or concerns regarding this document, do not hesitate to contact our dedicated support team:
                    </p>
                    <div className="pt-2 flex flex-wrap gap-4 items-center text-sm font-semibold">
                      <a
                        href="https://mail.google.com/mail/u/0/?fs=1&to=support@edujunction.co.in&tf=cm"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                        <span>support@edujunction.co.in</span>
                      </a>
                      <a
                        href="https://edujunction.co.in"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-amber-600 hover:border-amber-300 transition-colors"
                      >
                        <Globe className="w-4 h-4 text-amber-500" />
                        <span>edujunction.co.in</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Meta Footer */}
            <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-stone-400">
              <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>EduJunction Legal &amp; Regulatory Compliance</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};
