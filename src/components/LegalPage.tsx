import React from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader } from './common/PublicHeader';
import { PublicFooter } from './common/PublicFooter';
import { GraduationCap, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'disclaimer';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      text: 'Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your information when you use the EduJunction platform. We only collect data necessary to provide personalized learning experiences and do not sell your personal data to third parties. For a full list of data processing policies, please contact our support team.'
    },
    terms: {
      title: 'Terms of Service',
      text: 'By using EduJunction, you agree to these Terms of Service. The platform is provided for educational purposes, and you agree not to misuse any part of the service, including the gamification elements and assessment tools. We reserve the right to suspend accounts that violate academic integrity or our community guidelines.'
    },
    disclaimer: {
      title: 'Disclaimer',
      text: 'EduJunction provides diagnostic educational assessments. While we strive for accuracy, automated evaluation engines may occasionally produce inaccurate suggestions. The platform is meant to supplement, not replace, formal education and professional teacher guidance. EduJunction is not liable for any academic outcomes based solely on the usage of this platform.'
    }
  };

  const { title, text } = content[type];

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            Legal Information
          </div>

          <h1 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight text-stone-900">
            {title}
          </h1>

          <div className="prose prose-slate max-w-none text-stone-600 leading-relaxed marker:text-yellow-500">
            <p className="text-sm sm:text-base font-medium text-stone-700 mb-4">
              {text}
            </p>
            <p className="text-sm">
              Please read this document carefully. Your access to and use of our platform is conditioned on your acceptance of and compliance with these terms. These apply to all visitors, users, and others who access or use the Service.
            </p>
            <p className="text-sm">
              If you have any questions or concerns regarding this document, do not hesitate to contact our dedicated support team.
            </p>

            <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-xs font-semibold text-stone-500">
              <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>EduJunction Policies</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};
