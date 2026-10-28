import React from "react";
import { ArrowUp, GraduationCap, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface PublicFooterMobileProps {
  facebookUrl: string;
  supportEmail: string;
  supportMailto: string;
  onQuickDemo?: (role: string) => void;
}

export const PublicFooterMobile: React.FC<PublicFooterMobileProps> = ({
  facebookUrl,
  supportEmail,
  supportMailto,
  onQuickDemo,
}) => {
  const backToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="sm:hidden px-4 pt-6 pb-4 bg-stone-950 text-stone-300">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900 to-stone-950 p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-stone-950">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-black text-white">Edu<span className="text-yellow-400">Junction</span></span>
        </div>
        <p className="mt-3 max-w-xs text-xs leading-relaxed text-stone-400">
          Study Buddy-powered learning for students, teachers and parents.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link to="/features" onClick={backToTop} className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white">Features</Link>
          <Link to="/pricing" onClick={backToTop} className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white">Pricing</Link>
          <Link to="/#free-mock-papers-2027" className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white">Free Mock Test</Link>
          <Link to="/blog" onClick={backToTop} className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white">Blogs</Link>
          <Link to="/privacy" onClick={backToTop} className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white">Privacy</Link>
          <Link to="/terms" onClick={backToTop} className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white">Terms</Link>
          <Link to="/disclaimer" onClick={backToTop} className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white">Disclaimer</Link>
          <Link to="/about" onClick={backToTop} className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white">About us</Link>
          <Link to="/contact" onClick={backToTop} className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white">Contact</Link>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <a href={supportMailto} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-yellow-300">
            <Mail className="h-4 w-4 shrink-0" /><span className="truncate">{supportEmail}</span>
          </a>
          <div className="flex shrink-0 items-center gap-3">
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="EduJunction on Facebook" className="text-stone-300 hover:text-white">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
          </div>
        </div>
        {onQuickDemo && <button type="button" onClick={() => onQuickDemo("admin")} className="mt-4 w-full rounded-xl border border-white/10 py-2 text-xs font-semibold text-stone-400">Super Admin Panel</button>}
      </div>
      <p className="pt-4 text-center text-[10px] text-stone-500">© {new Date().getFullYear()} EduJunction. All rights reserved.</p>
    </div>
  );
};
