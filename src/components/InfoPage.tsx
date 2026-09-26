import React from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader } from './common/PublicHeader';
import { PublicFooter } from './common/PublicFooter';
import {
  ArrowLeft,
  Info,
  BookOpen,
  Mail,
  Sparkles,
  Target,
  Eye,
  Zap,
  Users,
  BarChart3,
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { SEO } from './common/SEO';

interface InfoPageProps {
  type: 'about' | 'blog' | 'contact';
}

export const InfoPage: React.FC<InfoPageProps> = ({ type }) => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [type]);

  const content = {
    about: {
      title: 'About Us - EduJunction',
      subtitle: 'Building the future of personalized learning.',
      icon: Info,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      badge: 'Company Info',
      metaDesc: 'EduJunction was founded to make high-quality, personalized education accessible to every student with adaptive learning engines and holistic ecosystems.',
    },
    blog: {
      title: 'Our Blog',
      subtitle: 'Insights, pedagogy, and updates from the EduJunction team.',
      icon: BookOpen,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      badge: 'Publications',
      metaDesc: 'Welcome to our blog. Here we share the latest trends in ed-tech, deep dives into learning methodologies, and tips for parents and teachers.',
      text: 'Welcome to our blog. Here we share the latest trends in ed-tech, deep dives into learning methodologies, and tips for parents and teachers to maximize student engagement. Visit our Blog Hub for active articles.'
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'We would love to hear from you.',
      icon: Mail,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      badge: 'Help & Support',
      metaDesc: 'Reach out to the EduJunction team for school integration, parent questions, or student support at support@edujunction.co.in.',
      text: 'Whether you are a school looking to integrate our platform, a parent with a question, or a student needing help, our team is here for you. Reach out to us at support@edujunction.co.in or call our toll-free support line. We aim to respond to all inquiries within 24 hours.'
    },
  };

  const current = content[type];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 relative overflow-hidden">
      <SEO
        title={`${current.title}`}
        description={current.metaDesc}
        canonicalUrl={`https://www.edujunction.co.in/${type}`}
      />

      {/* Ambient Gradient Background Glows */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-yellow-300/25 via-amber-200/20 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-orange-200/20 via-yellow-100/30 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-t from-amber-100/20 to-transparent rounded-full blur-3xl -z-10" />

      {/* Header */}
      <PublicHeader />

      {/* Main Container */}
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

        {/* ── ABOUT US SPECIALIZED RICH LAYOUT ── */}
        {type === 'about' ? (
          <div className="space-y-12">
            {/* Hero Header */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200/80 text-amber-800 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Company Info</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 leading-tight">
                About Us - <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">EduJunction</span>
              </h1>
              <p className="text-lg sm:text-xl font-medium text-stone-600">
                Building the future of personalized learning.
              </p>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
                <strong className="text-stone-900 font-semibold">EduJunction</strong> was founded with a simple mission: to make high-quality, personalized education accessible to every student. We believe that every child learns differently, and our adaptive learning engine adapts to those unique needs. By bridging the gap between students, teachers, and parents, we are creating a holistic ecosystem where learning never stops.
              </p>
            </div>

            {/* Our Story Section */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 border border-amber-200/70 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Our Story</h2>
              </div>
              <p className="text-stone-700 leading-relaxed text-base sm:text-lg">
                EduJunction began as an idea to solve one of education&apos;s oldest problems — the <span className="text-amber-700 font-semibold">&ldquo;one-size-fits-all&rdquo;</span> classroom. Traditional learning systems often leave students behind or fail to challenge them enough. We set out to build a smarter platform that meets every learner exactly where they are, using diagnostic assessments, adaptive content, and gamified engagement to make learning both effective and enjoyable.
              </p>
            </div>

            {/* Mission & Vision Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mission Card */}
              <div className="p-7 rounded-3xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all" />
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 font-bold">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-stone-900 mb-3 tracking-tight">Our Mission</h3>
                <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                  To democratize access to personalized, high-quality education — empowering students to learn at their own pace, teachers to teach smarter, and parents to stay meaningfully involved in their child&apos;s academic journey.
                </p>
              </div>

              {/* Vision Card */}
              <div className="p-7 rounded-3xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl group-hover:bg-orange-400/20 transition-all" />
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-5 font-bold">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-stone-900 mb-3 tracking-tight">Our Vision</h3>
                <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                  A world where every student has access to a learning experience tailored to their individual needs — one where curiosity is nurtured, gaps are identified early, and no learner is left behind.
                </p>
              </div>
            </div>

            {/* What Drives Us Grid */}
            <div className="space-y-6">
              <div className="text-center sm:text-left space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" />
                  Core Principles
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  What Drives Us
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Pillar 1 */}
                <div className="p-6 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs hover:border-amber-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-stone-900 mb-2">Adaptive Learning</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Our engine continuously adjusts content difficulty and pacing based on real-time performance, ensuring every student stays challenged but never overwhelmed.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="p-6 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs hover:border-blue-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-stone-900 mb-2">Holistic Ecosystem</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    We connect students, educators, and parents on one platform, fostering collaboration and transparency in the learning process.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="p-6 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-stone-900 mb-2">Data-Driven Insights</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Diagnostic assessments and progress tracking give students and teachers clear, actionable insights into strengths and growth areas.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="p-6 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs hover:border-purple-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3.5">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-stone-900 mb-2">Accessibility First</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    We&apos;re committed to making quality education tools available to learners across diverse backgrounds and learning environments.
                  </p>
                </div>
              </div>
            </div>

            {/* Join Us on This Journey (Call to Action Card) */}
            <div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50/70 border border-amber-200 shadow-sm overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Get Started Today</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
                  Join Us on This Journey
                </h3>
                <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                  Whether you&apos;re a student aiming to reach your full potential, a teacher looking for smarter tools, or a parent wanting to stay engaged in your child&apos;s education - <strong className="text-stone-900 font-semibold">EduJunction</strong> is built for you.
                </p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <Link
                    to="/admin/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-stone-950 font-bold text-sm shadow-xs hover:from-yellow-400 hover:to-amber-400 transition-all hover:scale-102"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm border border-stone-200 shadow-2xs hover:border-amber-300 transition-colors"
                  >
                    <span>Contact Team</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── GENERIC LAYOUT FOR BLOG / CONTACT ── */
          <div className="max-w-3xl space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${current.bg} ${current.color} text-xs font-bold`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{current.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900">
              {current.title}
            </h1>
            <p className="text-base font-medium text-stone-500">{current.subtitle}</p>

            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs leading-relaxed text-stone-700 space-y-5">
              <p className="text-base sm:text-lg leading-relaxed">{current.text}</p>
              {type === 'contact' && (
                <div className="pt-2 flex flex-wrap gap-4 items-center">
                  <a
                    href="https://mail.google.com/mail/u/0/?fs=1&to=support@edujunction.co.in&tf=cm"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-stone-950 font-bold text-sm shadow-xs hover:from-yellow-400 hover:to-amber-400 transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Email via Gmail</span>
                  </a>
                  <a
                    href="https://edujunction.co.in"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm transition-colors"
                  >
                    <Globe className="w-4 h-4 text-amber-500" />
                    <span>edujunction.co.in</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};
