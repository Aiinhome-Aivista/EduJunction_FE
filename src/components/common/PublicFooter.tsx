import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, GraduationCap, Mail } from "lucide-react";

export interface PublicFooterProps {
  isBackendOnline?: boolean;
  onQuickDemo?: (role: string) => void;
}

const footerLinkClass = "inline-flex min-h-8 items-center text-sm text-stone-300 transition-colors hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 rounded-sm";

export const PublicFooter: React.FC<PublicFooterProps> = ({ onQuickDemo }) => {
  const facebookUrl = import.meta.env.VITE_FACEBOOK_URL || "https://www.facebook.com/edujunction.co.in";
  const supportEmail = "support@edujunction.co.in";

  return (
    <footer className="relative overflow-hidden border-t border-stone-800 bg-stone-950 text-stone-300">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-yellow-400/[0.06] blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_2fr] lg:gap-12">
          <div>
            <Link to="/" aria-label="EduJunction home" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-4 focus-visible:ring-offset-stone-950">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-stone-950 shadow-lg shadow-yellow-400/15">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-xl font-black tracking-tight text-white">Edu<span className="text-yellow-400">Junction</span></span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-stone-300">
              Adaptive learning that brings students, teachers and parents together to make every study session count.
            </p>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit EduJunction on Facebook (opens in a new tab)"
              className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-700 bg-stone-900 text-stone-300 transition hover:border-stone-500 hover:bg-stone-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:col-span-2 lg:col-span-1 lg:gap-6">
          <nav aria-label="Platform links">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">Platform</h2>
            <ul className="mt-4 space-y-1">
              <li><Link to="/features" onClick={() => window.scrollTo(0, 0)} className={footerLinkClass}>Features</Link></li>
              <li><Link to="/pricing" onClick={() => window.scrollTo(0, 0)} className={footerLinkClass}>Pricing</Link></li>
              <li><Link to="/#free-mock-papers-2027" className={footerLinkClass}>Free Mock Test</Link></li>
              <li><Link to="/blog" className={footerLinkClass}>Blogs</Link></li>
            </ul>
          </nav>

          <nav aria-label="Legal links">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">Legal</h2>
            <ul className="mt-4 space-y-1">
              <li><Link to="/privacy" className={footerLinkClass}>Privacy Policy</Link></li>
              <li><Link to="/terms" className={footerLinkClass}>Terms of Service</Link></li>
              <li><Link to="/disclaimer" className={footerLinkClass}>Disclaimer</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">Company &amp; Support</h2>
            <ul className="mt-4 space-y-1">
              <li><Link to="/about" className={footerLinkClass}>About Us</Link></li>
              <li><Link to="/contact" className={footerLinkClass}>Contact</Link></li>
            </ul>
            <a
              href={`mailto:${supportEmail}`}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-yellow-400/25 bg-yellow-400/10 px-3 text-sm font-semibold text-yellow-300 transition hover:border-yellow-300/50 hover:bg-yellow-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {supportEmail}
            </a>
          </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-stone-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone-400">© {new Date().getFullYear()} EduJunction. All rights reserved.</p>
          <p className="flex items-center gap-2 text-sm font-semibold text-stone-200">
            <GraduationCap className="h-5 w-5 shrink-0 text-yellow-400" aria-hidden="true" />
            Ready to make learning <span className="-ml-2 text-yellow-400">smarter?</span>
          </p>
          {onQuickDemo && (
            <button
              type="button"
              onClick={() => onQuickDemo("admin")}
              className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-stone-700 px-3 text-xs font-medium text-stone-300 transition hover:border-stone-500 hover:bg-stone-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 sm:self-auto"
            >
              Super Admin Panel <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
