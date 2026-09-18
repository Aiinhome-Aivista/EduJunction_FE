import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export interface PublicFooterProps {
  isBackendOnline?: boolean;
  onQuickDemo?: (role: string) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ isBackendOnline, onQuickDemo }) => (
  <footer className="bg-stone-950 text-stone-500 border-t border-stone-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 text-stone-900 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-black text-white">Edu<span className="text-yellow-500">Junction</span></span>
          </div>
          <p className="mt-3 text-xs leading-relaxed max-w-sm">
            Study Buddy-powered adaptive learning that connects students, teachers and parents.
          </p>
          {isBackendOnline !== undefined && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-800 text-[10px]">
              <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline === false ? 'bg-rose-500' : 'bg-yellow-500'}`} />
              Platform: {isBackendOnline === false ? 'Offline' : 'Online'}
            </div>
          )}
        </div>
        <div>
          <div className="text-white text-xs font-black uppercase tracking-wider">Platform</div>
          <div className="mt-3 space-y-2 text-xs">
            <a href="/#features" className="block hover:text-white transition-colors">Features</a>
            <a href="/#how-it-works" className="block hover:text-white transition-colors">How It Works</a>
            <a href="/#roles" className="block hover:text-white transition-colors">For Everyone</a>
            <a href="/#demo" className="block hover:text-white transition-colors">Demo</a>
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
          <div className="text-white text-xs font-black uppercase tracking-wider">Company</div>
          <div className="mt-3 space-y-2 text-xs">
            <Link to="/about" className="block hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="block hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
        <span>© {new Date().getFullYear()} EduJunction. All rights reserved.</span>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {onQuickDemo && (
            <button
              onClick={() => onQuickDemo('admin')}
              className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
            >
              Super Admin Panel
            </button>
          )}
        </div>
      </div>
    </div>
  </footer>
);
