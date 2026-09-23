import React from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader } from './common/PublicHeader';
import { PublicFooter } from './common/PublicFooter';
import { GraduationCap, ArrowLeft, Info, BookOpen, Mail } from 'lucide-react';

interface InfoPageProps {
  type: 'about' | 'blog' | 'contact';
}

export const InfoPage: React.FC<InfoPageProps> = ({ type }) => {
  const content = {
    about: {
      title: 'About Us',
      subtitle: 'Building the future of personalized learning.',
      icon: Info,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      text: 'EduJunction was founded with a simple mission: to make high-quality, personalized education accessible to every student. We believe that every child learns differently, and our adaptive learning engine adapts to those unique needs. By bridging the gap between students, teachers, and parents, we are creating a holistic ecosystem where learning never stops.'
    },
    blog: {
      title: 'Our Blog',
      subtitle: 'Insights, pedagogy, and updates from the EduJunction team.',
      icon: BookOpen,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      text: 'Welcome to our blog. Here we share the latest trends in ed-tech, deep dives into learning methodologies, and tips for parents and teachers to maximize student engagement. (This page is currently a placeholder. Full blog posts will be available soon.)'
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'We would love to hear from you.',
      icon: Mail,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      text: 'Whether you are a school looking to integrate our platform, a parent with a question, or a student needing help, our team is here for you. Reach out to us at support@edujunction.edu or call our toll-free number. We aim to respond to all inquiries within 24 hours.'
    },
  };

  const { title, subtitle, icon: Icon, color, bg, text } = content[type];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-300/20 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-amber-300/20 rounded-full blur-3xl -z-10 mix-blend-multiply" />

      {/* Navbar */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 z-10">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-yellow-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
        </div>

        <div className="max-w-3xl">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${bg} ${color} text-xs font-bold mb-3`}>
            <Icon className="w-3.5 h-3.5" />
            Company Info
          </div>

          <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight text-stone-900">
            {title}
          </h1>
          <p className="text-sm font-semibold text-stone-500 mb-6">{subtitle}</p>

          <div className="prose prose-slate max-w-none text-stone-600 leading-relaxed">
            <p className="text-sm sm:text-base font-medium text-stone-700 mb-4">
              {text}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};
