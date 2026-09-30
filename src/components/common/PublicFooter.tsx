import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Mail } from "lucide-react";

export interface PublicFooterProps {
  isBackendOnline?: boolean;
  onQuickDemo?: (role: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ isBackendOnline, onQuickDemo }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const facebookUrl = import.meta.env.VITE_FACEBOOK_URL || "https://www.facebook.com/edujunction.co.in";
  const supportEmail = "support@edujunction.co.in";
  const supportMailto = "https://mail.google.com/mail/u/0/?fs=1&to=support@edujunction.co.in&tf=cm";

  const handleFooterNav = (path: string, sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== path) {
      navigate(path);
    }
    if (sectionId === 'hero' || sectionId === 'top' || sectionId === '' || sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId) || (sectionId === 'for-everyone' ? document.getElementById('roles') : null);
      if (el) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 72;
        const y = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-500 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-md shadow-yellow-400/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-black text-white text-xl">Edu<span className="text-yellow-500">Junction</span></span>
            </div>
            <p className="mt-3 text-xs leading-relaxed max-w-sm">
              Study Buddy-powered adaptive learning that connects students, teachers and parents.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="EduJunction on Facebook"
                className="text-stone-400 hover:text-[#1877F2] transition-colors duration-200 inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 fill-current transition-transform hover:scale-110" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <div className="text-white text-xs font-black uppercase tracking-wider">Platform</div>
            <div className="mt-3 space-y-2 text-xs">
              <Link to="/features" onClick={(e) => handleFooterNav('/features', 'features', e)} className="block hover:text-white transition-colors">Features</Link>
              <Link to="/how-it-works" onClick={(e) => handleFooterNav('/how-it-works', 'how-it-works', e)} className="block hover:text-white transition-colors">How It Works</Link>
              <Link to="/for-everyone" onClick={(e) => handleFooterNav('/for-everyone', 'for-everyone', e)} className="block hover:text-white transition-colors">For Everyone</Link>
              <Link to="/demo" onClick={(e) => handleFooterNav('/demo', 'demo', e)} className="block hover:text-white transition-colors">Demo</Link>
              <Link to="/blog" className="block hover:text-white transition-colors">Blogs</Link>
            </div>
          </div>
          <div>
            <div className="text-white text-xs font-black uppercase tracking-wider">Legal</div>
            <div className="mt-3 space-y-2 text-xs">
              <Link to="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/disclaimer" className="block hover:text-white transition-colors">Disclaimer</Link>
            </div>
          </div>
          <div>
            <div className="text-white text-xs font-black uppercase tracking-wider">Company & Support</div>
            <div className="mt-3 space-y-2 text-xs">
              <Link to="/about" className="block hover:text-white transition-colors">About Us</Link>
              <Link to="/contact" className="block hover:text-white transition-colors">Contact</Link>
              <a
                href={supportMailto}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-yellow-400 hover:text-yellow-300 transition-colors pt-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{supportEmail}</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-stone-800 grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-[11px]">
          <div className="text-center md:text-left text-stone-500">
            <span>© {new Date().getFullYear()} EduJunction. All rights reserved.</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 text-center">
            <div className="w-8 h-8 rounded-xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-md shadow-yellow-400/20 shrink-0">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <span className="text-stone-200 font-extrabold text-xl sm:text-xl tracking-tight">
              Ready to make learning <span className="text-yellow-400">smarter</span>?
            </span>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4 md:gap-6">
            {onQuickDemo && (
              <button
                onClick={() => onQuickDemo('admin')}
                className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
              >
                Super Admin Panel
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
